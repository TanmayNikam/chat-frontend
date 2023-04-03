import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { HideLoader } from "../../../redux/loaderSlice";
import moment from "moment";
import { SetAllChats, SetSelectedChat } from "../../../redux/userSlice";

const GroupLists = () => {
  const { allChats, user } = useSelector((state) => state.userReducer);
  const [groups, setGroups] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    let group = allChats?.filter(
      (chat) =>
        chat.members.length > 2 &&
        chat.members.map((mem) => mem._id).includes(user._id)
    );
    setGroups(group);
    dispatch(HideLoader());
  }, [allChats]);

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

  const getLastMsg = (obj) => {
    // const chats = allChats.filter((chat) => chat.members.length > 2);
    // const chat = chats.find((chat) =>
    //   chat.members.map((mem) => mem._id).includes(obj._id)
    // );

    if (!obj || !obj.lastMessage) {
      return "";
    } else {
      const lastMsgPerson =
        obj?.lastMessage?.sender === user._id ? "You : " : "";
      return (
        <div className="flex justify-between w-72">
          <h1 className="text-gray-600 text-sm">
            {lastMsgPerson} {obj?.lastMessage?.text}
          </h1>
          <h1 className="text-gray-500 text-sm">
            {getDateInRegualarFormat(obj?.lastMessage?.createdAt)}
          </h1>
        </div>
      );
    }
  };

  const openChat = (group) => {
    dispatch(SetSelectedChat(group));
  };

  return (
    <div>
      {groups &&
        groups.map((group) => (
          <div
            className="shadow-sm border p-2 rounded-xl bg-white flex justify-between items-center cursor-pointer w-full mt-2"
            onClick={() => openChat(group)}
          >
            <div className="flex gap-3 items-center">
              <div className="bg-gray-400 rounded-full h-12 w-12 flex items-center justify-center relative">
                <div>
                  <h1 className="uppercase text-xl font-semibold text-white">
                    {group.name[0]}
                  </h1>
                </div>
              </div>
              <div className="flex flex-col">
                <h1>{group.name}</h1>
                {getLastMsg(group)}
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};

export default GroupLists;
