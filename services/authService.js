import User from "../models/userModel.js";


export const updateUserRoleService = async (res, id, role) => {
    const user = await User.findByIdAndUpdate(id, { role }, { new: true });
  
    res.status(201).json({
      success: true,
      user,
    });
  }

