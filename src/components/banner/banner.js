// banner.js
import React from 'react';
import { Container, Box } from '@mui/material';
import Carousel from "./carousel"; // Use the correct name, capital "Carousel"

const Banner = () => {
  return (
    <Box
      sx={{
        backgroundImage: "url('/banner2.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "400px",
      }}
    >
      <Container
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          paddingTop: 3,
          justifyContent: "center",
          textAlign: "center",
          color: "white",
        }}
      >
        <Box
          sx={{
            display: 'flex',
            height: '40%',
            flexDirection: 'column',
            justifyContent: "center",
            textAlign: "center"
          }}
        >
          <h1>Welcome to InvestSmart</h1>
          <p>Track your favorite cryptocurrencies with ease!</p>
        </Box>
        <Carousel /> {/* Use capital "Carousel" here */}
      </Container>
    </Box>
  );
};

export default Banner;
