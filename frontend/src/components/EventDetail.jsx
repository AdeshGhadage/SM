import React from "react";
import EventData from "../data/EventData";
import axios from "axios";

function loadscript(src) {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    document.body.appendChild(script);
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

function EventDetail(link) {
  const event = EventData.find(({ link }) => link === link);
  console.log("this is my link");
  console.log(event);
  let myclass = "tab-pane active";

  async function displayRazorpay() {
    const res = await loadscript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );

    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    const data = await axios
      .post("http://localhost:5000/razorpay" + event.link, {
        token: localStorage.getItem("token"),
      })
      .then((t) => t.data);

    const options = {
      key: "rzp_test_tzyr3bXBeGsUoZ", // Enter the Key ID generated from the Dashboard
      amount: data.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
      currency: data.currency,
      order_id: data.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
      name: "Capature the water Registeration", //your business name
      description: "Test Transaction",
      image: "img/logo.png",
      callback_url: "http://localhost:5000/success" + event.link,
      prefill: {
        //We recommend using the prefill parameter to auto-fill customer's contact information especially their phone number
        name: data.name,
        email: data.email,
        contact: data.contact,
      },
      notes: {
        address: "Razorpay Corporate Office",
      },
      theme: {
        color: "#3399cc",
      },
    };
    console.log(options);

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  }

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
              <img src={event.poster} class="img-fluid" alt="" />
              <p class="mt-4 text-center">{event.description}</p>
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
                <p>
                <a
                  href={event.brochure}
                  class="btn btn-secondary-gradient rounded-pill py-2 px-4"
                >
                  Info Brochure
                </a>
                </p>
              </div>

              <div class="course-info d-flex justify-content-between align-items-center mb-2">
                <h5>Submission</h5>
                <p>
                  <a
                    class="btn btn-secondary-gradient rounded-pill py-2 px-4"
                    href={event.submission}
                  >
                    Form
                  </a>
                </p>
              </div>

              {localStorage.getItem("token") ? (
                <div class="course-info d-flex justify-content-between align-items-center mb-2">
                  <h5>Register Event</h5>
                  <p>
                    <a
                      class="btn btn-secondary-gradient rounded-pill py-2 px-4"
                      onClick={displayRazorpay}
                    >
                      Register Now
                    </a>
                  </p>
                </div>
              ) : (
                <div class="course-info d-flex justify-content-between align-items-center mb-2">
                  <h5>Register Event</h5>
                  <p>
                    <a
                      href="/register"
                      class="btn btn-primary-gradient rounded-pill py-2 px-4 navbar-nav"
                    >
                      login
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div class="container text-center" data-aos="fade-up">
          <div class="row">
            <div class="col-lg-3">
              <ul class="nav nav-tabs flex-column">
                {event.rulestab.map((tab) => (
                  <li class="nav-item">
                    <a
                      class="nav-link rounded"
                      data-bs-toggle="tab"
                      href={"#tab-" + tab.tabId}
                    >
                      <h5>{tab.heading}</h5>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div class="col-lg-9 mt-4 mt-lg-0">
              <div class="tab-content">
                {event.rulestab.map((tab) => (
                  <div class="tab-pane" id={"tab-" + tab.tabId}>
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
