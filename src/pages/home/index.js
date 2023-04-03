import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import ChatArea from "./components/ChatArea";
import UserSearch from "./components/UserSearch";
import UsersList from "./components/UsersList";
import GroupLists from "./components/GroupLists";
import { ShowLoader } from "../../redux/loaderSlice";
import { SetSelectedChat } from "../../redux/userSlice";

function Home({ socket }) {
  const [searchKey, setSearchKey] = React.useState("");
  const { selectedChat, user } = useSelector((state) => state.userReducer);
  const [onlineUsers, setOnlineUsers] = React.useState([]);
  const [isGroup, setIsGroup] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      socket.emit("join-room", user._id);
      socket.emit("came-online", user._id);

      socket.on("online-users-updated", (users) => {
        setOnlineUsers(users);
      });
    }
  }, [user]);

  return (
    <div className="flex gap-5">
      <div className="w-96">
        {!isGroup && (
          <UserSearch searchKey={searchKey} setSearchKey={setSearchKey} />
        )}
        <div className="flex items-center w-full gap-1 mt-2 mb-2">
          <button
            className="text-center w-1/2 p-2 text-lg border border-gray-400 rounded cursor-pointer"
            onClick={() => {
              dispatch(ShowLoader());
              dispatch(SetSelectedChat(null));
              setIsGroup(false);
            }}
            disabled={!isGroup}
          >
            Users
          </button>
          <button
            className="text-center w-1/2 p-2 text-lg border border-gray-400 rounded cursor-pointer"
            onClick={() => {
              dispatch(ShowLoader());
              dispatch(SetSelectedChat(null));
              setIsGroup(true);
            }}
            disabled={isGroup}
          >
            Groups
          </button>
        </div>
        {!isGroup && (
          <UsersList
            searchKey={searchKey}
            socket={socket}
            onlineUsers={onlineUsers}
          />
        )}

        {isGroup && <GroupLists socket={socket} setIsGroup={setIsGroup} />}
      </div>

      {selectedChat && (
        <div className="w-full">
          <ChatArea socket={socket} isGroup={isGroup} />
        </div>
      )}

      {!selectedChat && (
        <div className="w-full h-[80vh]  items-center justify-center flex bg-white flex-col">
          <img
            src="https://www.pngmart.com/files/16/Speech-Chat-Icon-Transparent-PNG.png"
            alt=""
            className="w-96 h-96"
          />
          <h1 className="text-2xl font-semibold text-gray-500">
            Select a user to chat
          </h1>
        </div>
      )}
    </div>
  );
}

export default Home;
