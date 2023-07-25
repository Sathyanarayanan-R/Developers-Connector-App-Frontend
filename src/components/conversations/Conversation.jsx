import { useEffect, useState } from "react";
import "./conversation.css";

export default function Conversation({ conversation, currentUser, otherUsers }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const friendId = conversation.members.find((m) => m !== currentUser._id);

    const getUser = async () => {
      try {
        const res = otherUsers.find((user) => user._id == friendId );
        setUser(res);
      } catch (err) {
        console.log(err);
      }
    };
    getUser();
  }, [currentUser, otherUsers, conversation]);

  return (
    <div className="conversation" id={conversation._id}>
      <img
        className="conversationImg"
        src={user?.avatar}
        alt=""
      />
      <span className="conversationName">{user?.name}</span>
    </div>
  );
}
