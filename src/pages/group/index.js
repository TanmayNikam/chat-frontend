import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { HideLoader, ShowLoader } from "../../redux/loaderSlice";
import { CreateNewChat, updateGroup } from "../../apicalls/chats";
import { toast } from "react-hot-toast";
import {
  SetAllChats,
  SetSelectGroupForEdit,
  SetSelectedChat,
} from "../../redux/userSlice";

const AddEditGroup = ({ socket }) => {
  const { allUsers, allChats, user, selectGroupForEdit, selectedChat } =
    useSelector((state) => state.userReducer);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchKey, setSearchKey] = useState("");
  const [groupName, setGroupName] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (selectGroupForEdit) {
      setGroupName(selectGroupForEdit.name);
      setSelectedUsers(selectGroupForEdit.members);
    }
  }, [selectGroupForEdit]);

  const selectUnSelectUsers = (usr) => {
    if (selectedUsers.find((u) => u._id === usr._id))
      setSelectedUsers(
        selectedUsers.filter((userObj) => userObj._id !== usr._id)
      );
    else setSelectedUsers([...selectedUsers, usr]);
  };



  const getUsers = () => {
    if (allUsers) {
      if (searchKey === "") return allUsers;
      else
        return allUsers.filter((user) =>
          user.name.toLowerCase().includes(searchKey.toLowerCase())
        );
    }
  };

  const handleOnSubmit = async () => {
    try {
      if (selectedUsers.length === 0) {
        toast.error("Select atleast 1 user");
        return;
      }
      if (groupName === "") {
        toast.error("Name cannot be empty");
        return;
      }

      dispatch(ShowLoader());
      let members = selectedUsers.map((mem) => mem._id);
      members = [...members, user._id];
      const response = await CreateNewChat({
        name: groupName,
        members,
        createdBy: user._id,
        type: "group",
      });
      if (response.success) {
        toast.success(response.message);
        const newChat = response.data;
        const updatedChats = [...allChats, newChat];
        socket.emit("add-group", { chat: newChat });
        dispatch(SetAllChats(updatedChats));
        dispatch(SetSelectedChat(null));
        navigate("/");
      } else {
        toast.error(response.message);
      }
      dispatch(HideLoader());
    } catch (error) {
      console.log(error);
      dispatch(HideLoader());
      toast.error(error.message);
    }
  };

  const editGoup = async () => {
    try {
      if (selectedUsers.length === 0) {
        toast.error("Select atleast 1 user");
        return;
      }
      if (groupName === "") {
        toast.error("Name cannot be empty");
        return;
      }
      dispatch(ShowLoader());
      const members = selectedUsers.map((mem) => mem._id);
      const response = await updateGroup({
        _id: selectGroupForEdit._id,
        members,
        name: groupName,
      });
      dispatch(HideLoader());
      if (response.success) {
        toast.success(response.message);
        const newChat = response.data;
        socket.emit("edit-group", {
          chat: newChat,
          members: selectedChat.members.map((mem) => mem._id),
        });
        let updatedChats = allChats.filter((chat) => chat._id !== newChat._id);
        updatedChats = [...updatedChats, newChat];
        dispatch(SetAllChats(updatedChats));
        dispatch(SetSelectGroupForEdit(null));
        dispatch(SetSelectedChat(null));
        navigate("/");
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.log(error);
      dispatch(HideLoader());
      toast.error(error.message);
    }
  };

  return (
    <div className="p-5">
      <i
        className="ri-arrow-left-line text-3xl text-primary cursor-pointer pl-5"
        onClick={() => {
          dispatch(SetSelectedChat(null));
          navigate("/");
        }}
      ></i>
      <div className="mb-5 flex justify-between mt-5">
        <input
          type="text"
          className="rounded-xl w-72"
          placeholder="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
        <button
          className="contained-btn"
          onClick={() => {
            if (selectGroupForEdit) editGoup();
            else handleOnSubmit();
          }}
        >
          {selectGroupForEdit ? "Edit Group" : "Create Group"}
        </button>
      </div>
      <div className="relative flex">
        <input
          type="text"
          placeholder="Search users"
          className="rounded-xl border-gray-300 pl-10 text-gray-500 w-72"
          value={searchKey}
          onChange={(e) => setSearchKey(e.target.value)}
        />

        <i className="ri-search-line absolute top-2 left-4 text-gray-500"></i>
      </div>
      <div className="grid grid-cols-5 mt-10 gap-3">
        {getUsers().map((userObj) => {
          const isSelected = selectedUsers.find(
            (usr) => usr._id === userObj._id
          );
          return (
            <div
              key={userObj._id}
              className={`flex gap-5 items-center border border-gray-500 p-3 rounded-xl cursor-pointer ${
                isSelected && "border-green-800 border-4"
              }`}
              onClick={() => selectUnSelectUsers(userObj)}
            >
              {userObj.profilePic && (
                <img
                  src={userObj.profilePic}
                  alt="profile pic"
                  className="w-10 h-10 rounded-full"
                />
              )}
              {!userObj.profilePic && (
                <div className="bg-gray-400 rounded-full h-12 w-12 flex items-center justify-center relative">
                  <h1 className="uppercase text-xl font-semibold text-white">
                    {userObj.name[0]}
                  </h1>
                </div>
              )}
              <div className="flex flex-col gap-1">
                <div className="flex gap-1">
                  <div className="flex gap-1 items-center">
                    <h1>{userObj.name}</h1>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AddEditGroup;
