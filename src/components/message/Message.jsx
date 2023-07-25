import { useEffect, useState } from "react";
import "./message.css";
import { format } from "timeago.js";

export default function Message({ message, own, currentUser, otherUsers }) {

  const [user, setUser] = useState(null);

  useEffect(() => {

    const getUser = async () => {
      try {
        if (!own) {
          const res = otherUsers.find((user) => user._id == message.sender);
          setUser(res);
        } else {
          setUser(currentUser);
        }
      } catch (err) {
        console.log(err);
      }
    };
    getUser();
  }, [currentUser, otherUsers]);

  return (
    <div className={own ? "message own" : "message"}>
      <div className="messageTop">
        <img
          className="messageImg"
          src={user?.avatar}
          alt=""
        />
        <p className="messageText">{message.text}</p>
      </div>
      <div className="messageBottom">{format(message.createdAt)}</div>
    </div>
  );
}
