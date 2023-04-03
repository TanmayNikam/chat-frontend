import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GetMessages, SendMessage } from "../../../apicalls/messages";
import { ClearChatMessages, clearGroupMessages } from "../../../apicalls/chats";
import { HideLoader, ShowLoader } from "../../../redux/loaderSlice";
import toast from "react-hot-toast";
import moment from "moment";
import {
  SetAllChats,
  SetSelectGroupForEdit,
  SetSelectedChat,
} from "../../../redux/userSlice";
import store from "../../../redux/store";
import EmojiPicker from "emoji-picker-react";
import { useNavigate } from "react-router-dom";

function ChatArea({ socket, isGroup }) {
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
  const [isReceipentTyping, setIsReceipentTyping] = React.useState(false);
  const dispatch = useDispatch();
  const [newMessage, setNewMessage] = React.useState("");
  const { selectedChat, user, allChats, allUsers } = useSelector(
    (state) => state.userReducer
  );
  const [messages = [], setMessages] = React.useState([]);
  const receipentUser = selectedChat.members.find(
    (mem) => mem._id !== user._id
  );

  const navigate = useNavigate();

  const sendNewMessage = async (image) => {
    try {
      if (typeof image != "string" && newMessage === "") {
        toast.error("Message cannot be empty");
        return;
      }
      const message = {
        chat: selectedChat._id,
        sender: user._id,
        text: newMessage,
        image,
        readBy: selectedChat?.members
          .map((mem) => mem._id)
          .filter((mem) => mem !== user._id),
      };
      // send message to server using socket
      socket.emit("send-message", {
        ...message,
        members: selectedChat?.members.map((mem) => mem._id),
        createdAt: moment(new Date().toISOString()).format("YYYY-MM-DD h:mm a"),
        read: false,
      });

      // send message to server to save in db
      const response = await SendMessage(message);
      if (response.success) {
        dispatch(
          SetSelectedChat({ ...selectedChat, lastMessage: response.data })
        );
        setNewMessage("");
        setShowEmojiPicker(false);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const getMessages = async () => {
    try {
      dispatch(ShowLoader());
      const response = await GetMessages(selectedChat._id);
      dispatch(HideLoader());
      if (response.success) {
        setMessages(response.data);
      }
    } catch (error) {
      dispatch(HideLoader());
      console.log(error);
      toast.error(error.message);
    }
  };

  const clearUnreadMessages = async () => {
    try {
      if (selectedChat.type === "individual") {
        socket.emit("clear-unread-messages", {
          chat: selectedChat._id,
          members: selectedChat?.members.map((mem) => mem._id),
        });

        const response = await ClearChatMessages(selectedChat._id);

        if (response.success) {
          const updatedChats = allChats?.map((chat) => {
            if (chat._id === selectedChat?._id) {
              return response.data;
            }
            return chat;
          });
          dispatch(SetAllChats(updatedChats));
        }
      } else {
        socket.emit("clear-group-unread-messages", {
          chat: selectedChat._id,
          members: selectedChat?.members.map((mem) => mem._id),
          usr: user._id,
        });
        const response = await clearGroupMessages({
          chat: selectedChat._id,
          usr: user._id,
        });
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const getDateInRegualarFormat = (date) => {
    let result = "";

    if (moment(date).isSame(moment(), "day")) {
      result = moment(date).format("hh:mm");
    } else if (moment(date).isSame(moment().subtract(1, "day"), "day")) {
      result = `Yesterday ${moment(date).format("hh:mm")}`;
    } else if (moment(date).isSame(moment(), "year")) {
      result = moment(date).format("MMM DD hh:mm");
    }

    return result;
  };

  useEffect(() => {
    getMessages();
    if (selectedChat?.lastMessage?.sender !== user._id) {
      clearUnreadMessages();
    }

    socket.off("receive-message").on("receive-message", (message) => {
      const tempSelectedChat = store.getState().userReducer.selectedChat;
      if (tempSelectedChat._id === message.chat) {
        setMessages((messages) => [...messages, message]);
      }

      if (
        tempSelectedChat._id === message.chat &&
        message.sender !== user._id
      ) {
        clearUnreadMessages();
      }
    });

    socket.on("unread-messages-cleared", (data) => {
      const tempAllChats = store.getState().userReducer.allChats;
      const tempSelectedChat = store.getState().userReducer.selectedChat;

      if (data.chat === tempSelectedChat._id) {
        const updatedChats = tempAllChats?.map((chat) => {
          if (chat._id === data.chat) {
            return {
              ...chat,
              unreadMessages: 0,
            };
          }
          return chat;
        });
        dispatch(SetAllChats(updatedChats));

        setMessages((prevMessages) => {
          return prevMessages?.map((message) => {
            return {
              ...message,
              read: true,
            };
          });
        });
      }
    });

    socket.on("unread-group-messages-cleared", (data) => {
      setMessages((prevMessages) => {
        return prevMessages?.map((msg) => {
          return {
            ...msg,
            readBy: msg.readBy.filter((mem) => mem !== data.usr),
          };
        });
      });
    });

    socket.on("started-typing", (data) => {
      const selctedChat = store.getState().userReducer.selectedChat;
      if (data.chat === selctedChat._id && data.sender !== user._id) {
        setIsReceipentTyping(true);
      }
      setTimeout(() => {
        setIsReceipentTyping(false);
      }, 1500);
    });
  }, [selectedChat]);

  useEffect(() => {
    const messagesContainer = document.getElementById("messages");
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }, [messages, isReceipentTyping]);

  const onUploadImageClick = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader(file);
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      sendNewMessage(reader.result);
    };
  };
  const getUserName = (userId) => {
    return allUsers.find((usr) => usr._id === userId)?.name;
  };

  const handleUserNameClick = () => {
    if (isGroup && user._id === selectedChat.createdBy) {
      dispatch(SetSelectGroupForEdit(selectedChat));
      navigate("/create-edit-group");
    }
  };
  return (
    <div
      className={`bg-white h-[82vh] border rounded-2xl w-full flex flex-col justify-between p-5 ${
        isGroup && "cursor-pointer"
      }`}
    >
      <div>
        <div
          className="flex gap-5 items-center mb-2"
          onClick={handleUserNameClick}
        >
          {selectedChat.type === "group" && (
            <div className="bg-gray-500  rounded-full h-10 w-10 flex items-center justify-center">
              <h1 className="uppercase text-xl font-semibold text-white">
                {selectedChat.name[0]}
              </h1>
            </div>
          )}
          {selectedChat.type === "individual" && receipentUser.profilePic && (
            <img
              src={receipentUser.profilePic}
              alt="profile pic"
              className="w-10 h-10 rounded-full"
            />
          )}
          {selectedChat.type === "individual" && !receipentUser.profilePic && (
            <div className="bg-gray-500  rounded-full h-10 w-10 flex items-center justify-center">
              <h1 className="uppercase text-xl font-semibold text-white">
                {receipentUser.name[0]}
              </h1>
            </div>
          )}
          <h1 className="uppercase">
            {selectedChat.type === "individual"
              ? receipentUser.name
              : selectedChat.name}
          </h1>
        </div>
        <hr />
      </div>

      <div className="h-[55vh] overflow-y-scroll p-5" id="messages">
        <div className="flex flex-col gap-2">
          {messages?.map((message, index) => {
            const isCurrentUserIsSender = message.sender === user._id;
            return (
              <div className={`flex ${isCurrentUserIsSender && "justify-end"}`}>
                <div className="flex flex-col gap-1">
                  {message.text && (
                    <div
                      className={`${
                        selectedChat.type === "group" && "flex flex-col"
                      } ${
                        isCurrentUserIsSender
                          ? "bg-gray-300 text-primary rounded-bl-none"
                          : "bg-gray-300 text-primary rounded-tr-none"
                      } p-2 rounded-xl`}
                    >
                      {selectedChat.type === "group" && (
                        <h1 className="text-primary text-xs m-1 bg-gray-300">
                          {getUserName(message.sender)}
                        </h1>
                      )}
                      <h1>{message.text}</h1>
                    </div>
                  )}
                  {message.image && (
                    <img
                      src={message.image}
                      alt="message"
                      className="w-24 h-24 rounded-xl"
                    />
                  )}
                  <h1 className="text-gray-500 text-sm">
                    {getDateInRegualarFormat(message.createdAt)}
                  </h1>
                </div>
                {isCurrentUserIsSender && (
                  <div className="p-2">
                    <i
                      className={`ri-check-double-fill text-xl p1 font-semibold ${
                        selectedChat.type === "individual"
                          ? message.read
                            ? "text-blue-700"
                            : "text-gray-400"
                          : message?.readBy?.length === 0
                          ? "text-blue-700"
                          : "text-gray-400"
                      }`}
                    ></i>
                  </div>
                )}
              </div>
            );
          })}
          {isReceipentTyping && (
            <div className="pb-10">
              <h1 className="bg-blue-100 text-primary  p-2 rounded-xl w-max">
                typing...
              </h1>
            </div>
          )}
        </div>
      </div>

      <div className="h-18 rounded-xl border-gray-300 shadow border flex justify-between p-2 items-center relative">
        {showEmojiPicker && (
          <div className="absolute -top-96 left-0">
            <EmojiPicker
              height={350}
              onEmojiClick={(e) => {
                setNewMessage(newMessage + e.emoji);
              }}
            />
          </div>
        )}

        <div className="flex gap-2 text-xl">
          <label for="file">
            <i className="ri-link cursor-pointer text-xl" typeof="file"></i>
            <input
              type="file"
              id="file"
              style={{
                display: "none",
              }}
              accept="image/gif,image/jpeg,image/jpg,image/png"
              onChange={onUploadImageClick}
            />
          </label>
          <i
            className="ri-emotion-line cursor-pointer text-xl"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          ></i>
        </div>

        <input
          type="text"
          placeholder="Type a message"
          className="w-[90%] border-0 h-full rounded-xl focus:border-none"
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            socket.emit("typing", {
              chat: selectedChat._id,
              members: selectedChat?.members?.map((mem) => mem._id),
              sender: user._id,
            });
          }}
        />
        <button
          className="bg-primary text-white py-1 px-5 rounded h-max"
          onClick={() => sendNewMessage("")}
        >
          <i className="ri-send-plane-2-line text-white"></i>
        </button>
      </div>
    </div>
  );
}

export default ChatArea;
