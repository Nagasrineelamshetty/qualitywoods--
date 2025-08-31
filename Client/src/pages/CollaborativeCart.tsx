// src/components/CollaborativeCart.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../contexts/AuthContext';

interface IVote {
  userId: string;
  value: number; // 1 = upvote, -1 = downvote
}

interface IComment {
  userId: string;
  text: string;
  timestamp: string;
}

interface ICartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  votes: IVote[];
  comments: IComment[];
}

interface ICollaboration {
  sessionId: string;
  users: string[];
  cartItems: ICartItem[];
  createdAt: string;
}

const CollaborativeCart = () => {
  const { user } = useAuth();
  const { sessionId: urlSessionId } = useParams<{ sessionId: string }>(); // from /cart-:sessionId
  const sessionId = urlSessionId; // this is your sessionId
  const [session, setSession] = useState<ICollaboration | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComments, setNewComments] = useState<{ [key: string]: string }>({});
  const [numPeople, setNumPeople] = useState(1);
  const [summary, setSummary] = useState<{ totalPrice: number; perPerson: number }>({ totalPrice: 0, perPerson: 0 });

  // Fetch session data
  const fetchSession = async () => {
    if (!user?._id || !sessionId) return;

    try {
      const res = await axios.get(`/collaboration/${sessionId}`);
      setSession(res.data);
    } catch (err) {
      console.error('Error fetching session:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch session summary
  const fetchSummary = async () => {
    if (!session || !sessionId) return;

    try {
      const res = await axios.get(`/collaboration/${sessionId}/summary?numPeople=${numPeople}`);
      setSummary(res.data);
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  };

  useEffect(() => {
    fetchSession();
  }, [user, sessionId]);

  useEffect(() => {
    fetchSummary();
  }, [session, numPeople]);

  const handleVote = async (productId: string, voteType: 'up' | 'down') => {
    if (!session || !sessionId) return;
    try {
      const res = await axios.post('/collaboration/vote', {
        sessionId,
        productId,
        voteType,
      });
      setSession(res.data.session);
    } catch (err) {
      console.error('Voting failed:', err);
    }
  };

  const handleComment = async (productId: string) => {
    const text = newComments[productId]?.trim();
    if (!text || !session || !sessionId) return;

    try {
      const res = await axios.post('/collaboration/comment', {
        sessionId,
        productId,
        text,
      });
      setSession(res.data.session);
      setNewComments(prev => ({ ...prev, [productId]: '' }));
    } catch (err) {
      console.error('Comment failed:', err);
    }
  };

  const handleQuantityChange = async (productId: string, quantity: number) => {
    if (!session || !sessionId) return;

    try {
      const res = await axios.post('/collaboration/update-quantity', {
        sessionId,
        productId,
        quantity,
      });
      setSession(res.data.session);
    } catch (err) {
      console.error('Quantity update failed:', err);
    }
  };

  if (!user) {
    return <p className="text-center mt-10 text-red-600">Please login to access collaborative shopping.</p>;
  }

  if (loading) {
    return <p className="text-center mt-10">Loading collaborative session...</p>;
  }

  if (!session || session.cartItems.length === 0) {
    return <p className="text-center mt-10 text-gray-600">No items in the session yet.</p>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Collaborative Cart</h2>
      {session.cartItems.map(item => {
        const upVotes = item.votes.filter(v => v.value === 1).length;
        const downVotes = item.votes.filter(v => v.value === -1).length;

        return (
          <div key={item.productId} className="border rounded-lg shadow p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold">{item.name}</h3>
              <p className="text-sm text-green-600">Price: ₹{item.price} × {item.quantity}</p>
            </div>
            <div className="flex gap-2 mb-2">
              <button
                className="px-3 py-1 bg-blue-500 text-white rounded"
                onClick={() => handleVote(item.productId, 'up')}
              >
                👍 {upVotes}
              </button>
              <button
                className="px-3 py-1 bg-red-500 text-white rounded"
                onClick={() => handleVote(item.productId, 'down')}
              >
                👎 {downVotes}
              </button>
            </div>
            <div className="flex gap-2 mb-2 items-center">
              <label>Quantity:</label>
              <input
                type="number"
                value={item.quantity}
                min={0}
                onChange={e => handleQuantityChange(item.productId, Number(e.target.value))}
                className="border p-1 rounded w-20"
              />
            </div>
            <div>
              <h4 className="font-semibold">Comments:</h4>
              <ul className="list-disc list-inside text-sm text-gray-700">
                {item.comments.map((cmt, idx) => (
                  <li key={idx}>
                    <strong>{cmt.userId}:</strong> {cmt.text}
                  </li>
                ))}
              </ul>
              <div className="flex mt-2 gap-2">
                <input
                  type="text"
                  placeholder="Add a comment"
                  value={newComments[item.productId] || ''}
                  onChange={e =>
                    setNewComments(prev => ({ ...prev, [item.productId]: e.target.value }))
                  }
                  className="border p-1 rounded w-full"
                />
                <button
                  className="px-3 py-1 bg-green-600 text-white rounded"
                  onClick={() => handleComment(item.productId)}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        );
      })}

      <div className="mt-8 border-t pt-6">
        <h3 className="text-xl font-semibold mb-2">Split Payment</h3>
        <div className="flex items-center gap-2 mt-2">
          <label htmlFor="numPeople" className="text-sm font-medium">Number of people:</label>
          <input
            id="numPeople"
            type="number"
            min={1}
            value={numPeople}
            onChange={e => setNumPeople(Number(e.target.value))}
            className="border p-1 rounded w-20"
          />
        </div>
        <p className="mt-2 text-green-700">Total: ₹{summary.totalPrice}</p>
        <p className="mt-1 text-green-700">Per Person: ₹{summary.perPerson}</p>
      </div>
    </div>
  );
};

export default CollaborativeCart;
