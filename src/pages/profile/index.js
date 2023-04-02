import moment from "moment";
import React, { useEffect } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { HideLoader, ShowLoader } from "../../redux/loaderSlice";
import { SetUser } from "../../redux/userSlice";
import { UpdateProfilePicture } from "../../apicalls/users";
import { useNavigate } from "react-router-dom";

function Profile() {
  const { user } = useSelector((state) => state.userReducer);
  const [image = "", setImage] = React.useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const onFileSelect = async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader(file);
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      setImage(reader.result);
    };
  };

  useEffect(() => {
    if (user?.profilePic) {
      setImage(user.profilePic);
    }
  }, [user]);

  const updateProfilePic = async () => {
    try {
      dispatch(ShowLoader());
      const response = await UpdateProfilePicture(image);
      console.log(response);
      dispatch(HideLoader());
      if (response.success) {
        toast.success("Profile Pic Updated");
        dispatch(SetUser(response.data));
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.log(error);
      dispatch(HideLoader());
      toast.error(error);
    }
  };

  return (
    <div>
      <i
        className="ri-arrow-left-line text-3xl text-primary cursor-pointer pl-5"
        onClick={() => navigate("/")}
      ></i>
      {user && (
        <div className="flex items-center justify-center flex-col font-semibold text-gray-700 gap-10">
          <h1 className="text-3xl uppercase">{user.name}</h1>
          <h1 className="lowercase text-2xl">{user.email}</h1>
          <h1 className="text-xl">
            Created At: {moment(user.createdAt).format("MMMM Do YYYY")}
          </h1>
          {image && (
            <img
              src={image}
              alt="profile pic"
              className="w-48 h-48 rounded-full"
            />
          )}

          <label
            className="cursor-pointer p-3 outlined-btn items-center"
            htmlFor="file-input"
          >
            <input
              type="file"
              onChange={onFileSelect}
              className="border-none hidden"
              id="file-input"
            />
            Choose file
          </label>

          <button onClick={updateProfilePic} className="contained-btn">
            Upload
          </button>
        </div>
      )}
    </div>
  );
}

export default Profile;
