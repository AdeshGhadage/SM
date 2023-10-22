import React from "react";
import EventData from "../data/EventData";

function EventDetail(link) {
    const event = EventData.find(({ link }) => link === link);
    console.log(event);
    let myclass = "tab-pane active";
    
  return (
    <>
    <div class="container-xxl py-5">
            <div class="container py-5 px-lg-5">
                <div class="text-center pb-4 wow fadeInUp" data-wow-delay="0.1s">
                    <h5 class="text-primary-gradient fw-medium">How It Works</h5>
                    <h1 class="mb-2">{event.name}</h1>
                </div>

                <div class="row">
                    <div class="col-lg-8 mb-3">
                        <img src={event.poster} class="img-fluid" alt=""/>
                        <p class="mt-4 text-center">
                            {event.description}
                        </p>
                    </div>
                    <div class="col-lg-4">

                        <div class="course-info d-flex justify-content-between align-items-center mb-2">
                            <h5>Team Size</h5>
                            <p>{event.teamSize}</p>
                        </div>

                        <div class="course-info d-flex justify-content-between align-items-center mb-2">
                            <h5>Event Fee</h5>
                            <p>{event.fee}</p>
                        </div>

                        <div class="course-info d-flex justify-content-between align-items-center mb-2">
                            <h5>Prize Money</h5>
                            <p>{event.prize}</p>
                        </div>

                        <div class="course-info d-flex justify-content-between align-items-center mb-2">
                            <h5>Schedule</h5>
                            <p>{event.date}</p>
                        </div>

                        <div class="course-info d-flex justify-content-between align-items-center mb-2">
                            <h5>Schedule</h5>

                            <a href={event.brochure}
                                class="btn btn-secondary-gradient rounded-pill py-2 px-4"
                                >Info Brochure</a>
                        </div>

                        <div class="course-info d-flex justify-content-between align-items-center mb-2">
                            <h5>Submission</h5>
                            <p><a class="btn btn-secondary-gradient rounded-pill py-2 px-4" 
                                    href={event.submission}>Form</a>
                            </p>
                        </div>

                    </div>
                </div>

            </div>


            <div class="container text-center" data-aos="fade-up">
                <div class="row">
                    <div class="col-lg-3">
                        <ul class="nav nav-tabs flex-column">
                            {event.rulestab.map((tab) => (
                                <li class="nav-item">
                                <a class="nav-link rounded" data-bs-toggle="tab" href={"#tab-"+tab.tabId}>
                                    <h5>{tab.heading}</h5>
                                </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div class="col-lg-9 mt-4 mt-lg-0">
                        <div class="tab-content">
                            {event.rulestab.map((tab) => (
                                <div class="tab-pane" id={"tab-"+tab.tabId}>
                                <div class="row">
                                    <div class="col-lg-8 details order-2 order-lg-1">
                                        <h3>{tab.heading}</h3>
                                        {tab.data.map((data) => (
                                            <p>{data}</p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
  );
}

export default EventDetail;
