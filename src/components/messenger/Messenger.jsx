import "./messenger.css";
import { Link } from 'react-router-dom';
import Conversation from "../conversations/Conversation";
import Message from "../message/Message";
import ChatOnline from "../chatOnline/ChatOnline";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getProfiles } from '../../actions/profileAction';

function Messenger({ auth: { user }, getProfiles, profile: { profiles, loading } }) {
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socket = useRef();
  const scrollRef = useRef();

  useEffect(() => {
    const getConversations = async () => {
      try {

        const res = await axios.get("https://developers-connector-backend.onrender.com/api/conversations/" + user?._id);
        setConversations(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getConversations();
  }, [user?._id]);

  useEffect(() => {

    const sectionContainerEle = document.getElementById('sectionContainer');
    sectionContainerEle.style.margin = 0;
    sectionContainerEle.style.padding = '5px';

    socket.current = io("ws://developers-connector-socket-io.onrender.com");
    socket.current.on("getMessage", (data) => {
      setArrivalMessage({
        sender: data.senderId,
        text: data.text,
        createdAt: Date.now(),
      });
    });
  }, []);

  useEffect(() => {
    arrivalMessage &&
      currentChat?.members.includes(arrivalMessage.sender) &&
      setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage, currentChat]);

  useEffect(
    () => {
      getProfiles();
    },
    [getProfiles]
  );

  const users = profiles.map((profile) => {
    return profile.user;
  });

  const remainUsers = users.filter((u) => u._id !== user?._id);

  useEffect(() => {
    socket.current.emit("addUser", user?._id);
    socket.current.on("getUsers", (users) => {
      setOnlineUsers(
        remainUsers.filter((f) => users.some((u) => u.userId === f._id))
      );
    });
  }, [user]);

  useEffect(() => {
    const getMessages = async () => {
      try {
        const res = await axios.get("https://developers-connector-backend.onrender.com/api/messages/" + currentChat?._id);
        setMessages(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getMessages();
  }, [currentChat]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const message = {
      sender: user?._id,
      text: newMessage,
      conversationId: currentChat._id,
    };

    const receiverId = currentChat.members.find(
      (member) => member !== user?._id
    );

    socket.current.emit("sendMessage", {
      senderId: user?._id,
      receiverId,
      text: newMessage,
    });

    try {
      const res = await axios.post("https://developers-connector-backend.onrender.com/api/messages", message);
      setMessages([...messages, res.data]);
      setNewMessage("");
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);



  const handleSubmitConversation = (c) => {

    const conversationElements = document.getElementsByClassName('conversation');

    for (let j = 0; j < conversationElements.length; j++) {
      if (conversationElements[j].id !== c._id)
        conversationElements[j].style.backgroundColor = 'inherit';
      else
        conversationElements[j].style.backgroundColor = 'rgb(245, 243, 243)';
    }

    setCurrentChat(c);
  }

  return (
    <>
      {conversations.length > 0 ?
        (<div className="messenger">
          <div className="chatMenu">
            <div className="chatMenuWrapper">
              <input placeholder="Search for friends" className="chatMenuInput" />
              {conversations.map((c) => (
                <div onClick={() => handleSubmitConversation(c)}>
                  <Conversation conversation={c} currentUser={user} otherUsers={remainUsers} />
                </div>
              ))}
            </div>
          </div>
          <div className="chatBox">
            <div className="chatBoxWrapper">
              {currentChat ? (
                <>
                  <div className="chatBoxTop">
                    {messages.map((m) => (
                      <div ref={scrollRef}>
                        <Message message={m} own={m.sender === user?._id} currentUser={user} otherUsers={remainUsers} />
                      </div>
                    ))}
                  </div>
                  <div className="chatBoxBottom">
                    <textarea
                      className="chatMessageInput"
                      placeholder="write something..."
                      onChange={(e) => setNewMessage(e.target.value)}
                      value={newMessage}
                    ></textarea>
                    <button className="chatSubmitButton" onClick={handleSubmit}>
                      Send
                    </button>
                  </div>
                </>
              ) : (
                <span className="noConversationText">
                  Open a conversation to start a chat.
                </span>
              )}
            </div>
          </div>
          <div className="chatOnline">
            <div className="chatOnlineWrapper">
              <ChatOnline
                onlineUsers={onlineUsers}
                currentId={user?._id}
                setCurrentChat={setCurrentChat}
              />
            </div>
          </div>
        </div>) : (
          <>
            <h3>Chat</h3>
            <p className='lead'>
              <i className='fas fa-user' /> Welcome! <span className='text-color-g'> {user && user.name}</span>
            </p>
            <p>You have not yet setup a profile, please add some information to use the Chat Feature</p>
            <Link to='/createProfile' className='btn btn-primary my-1'>
              Create Profile
            </Link>
          </>
        )}
    </>
  );
}

Messenger.propTypes = {
  auth: PropTypes.object.isRequired,
  getProfiles: PropTypes.func.isRequired,
  profile: PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
  auth: state.authReducer,
  profile: state.profileReducer
});

export default connect(mapStateToProps, { getProfiles })(Messenger);
