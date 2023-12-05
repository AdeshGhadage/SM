import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import EventSection from "../components/EventSection";

function Events(){
    return(
        <>
        <div class="container-xxl bg-white p-0">
        <div class="container-xxl position-relative p-0" id="home">
          <Navbar page="events"/>
        </div>
        <EventSection></EventSection>
        <Footer />
        
      </div>
        </>
    );
}

export default Events;