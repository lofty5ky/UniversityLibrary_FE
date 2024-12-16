import { Box, Grid, colors } from '@mui/material';
import  { useState } from 'react';
import signinBg from "../assets/images/photo-1530608031805-8e170c1b793a.avif";
import signupBg from "../assets/images/photo-1472173148041-00294f0814a2.avif";
import SigninForm from '../components/SigninForm';
import SignupForm from '../components/SignupForm';
import {ScreenMode} from '../constant/constants.js'

const SigninPage = () => {
  const [left, setLeft] = useState(0);
  const [right, setRight] = useState("unset");
  const [width, setWidth] = useState(0);

  const [backgroundImage, setBackgroundImage] = useState(signinBg);
  const [currMode, setCurrMode] = useState(ScreenMode.SIGN_IN);

  const onSwitchMode = (mode) => {
    setWidth(100);

    const timeout1 = setTimeout(() => {
      setCurrMode(mode);
      setBackgroundImage(mode === ScreenMode.SIGN_IN ? signinBg : signupBg);
    }, 1100);

    const timeout2 = setTimeout(() => {
      setLeft("unset");
      setRight(0);
      setWidth(0);
    }, 1200);

    const timeout3 = setTimeout(() => {
      setRight("unset");
      setLeft(0);
    }, 2500);

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
    };
  };

  return (
    <Grid container sx={{ height: "100vh" }}>
      <Grid item xs={4} sx={{ position: "relative", padding: 3 }}>
        {
          currMode === ScreenMode.SIGN_IN ? (
            <SigninForm onSwitchMode={onSwitchMode} />
          ) : (
            <SignupForm onSwitchMode={onSwitchMode} />
          )
        }
        <Box sx={{
          position: "absolute",
          top: 0,
          left: left,
          right: right,
          width: `${width}%`,
          height: "100%",
          bgcolor: colors.grey[800],
          transition: "all 1s ease-in-out"
        }} />
      </Grid>
      <Grid item xs={8} sx={{
        position: "relative",
        backgroundImage: `url(${backgroundImage})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat"
      }}>
        <Box sx={{
          position: "absolute",
          top: 0,
          left: left,
          right: right,
          width: `${width}%`,
          height: "100%",
          bgcolor: colors.common.white,
          transition: "all 1s ease-in-out"
        }} />
      </Grid>
    </Grid>
  );
};

export default SigninPage;