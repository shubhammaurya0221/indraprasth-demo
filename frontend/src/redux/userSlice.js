import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userData: null,
  loading: true // used to delay route rendering until auth check completes
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    }
  }
});

export const { setUserData, setLoading } = userSlice.actions;
export default userSlice.reducer;
