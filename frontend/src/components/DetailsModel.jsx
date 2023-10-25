import React from "react";
import { useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";
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

function MyVerticallyCenteredModal(props) {
  console.log(props.user);
  //make a list of numbers from 1 to teamsize
    const numbers = [];
    for (let i = 1; i <= props.user.teamSize; i++) {
        numbers.push(i);
    }
    
  var sm_id = [];

  function registerToevent() {
    const data = {
        token: localStorage.getItem("token"),
        event: props.user.link,
        orderId: props.user.id,
        teammembers: sm_id,
    }

    axios
      .post("http://localhost:5000/register/event", data)
      .then((res) => {
        console.log(res);
        console.log(res.data);
      })
      .catch((err) => console.log(err));
  }

  async function displayRazorpay(data) {
    registerToevent();
    const res = await loadscript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );

    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    const options = {
      key: "rzp_test_tzyr3bXBeGsUoZ", // Enter the Key ID generated from the Dashboard
      amount: data.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
      currency: data.currency,
      order_id: data.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
      name: "Capature the water Registeration", //your business name
      description: "Test Transaction",
      image: "img/logo.png",
      callback_url: "http://localhost:5000/success" + data.link,
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
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Please confirm your details
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4>hellow {props.user.name}</h4>
        <p>Email : {props.user.email}</p>
        <p>contact number : {props.user.contact}</p>
        <p>SM id - captian : {props.user.sm_id}</p>
        <p>Order id : {props.user.id}</p>
        <p style={{
            color: "red",
        }}>Please put sm_id of your teammates correctly</p>
        {props.user.teamSize ? (
          <Form>
            {numbers.map((number) => (
              <>
                <Form.Group
                  className="mb-3"
                  controlId="exampleForm.ControlInput1"
                >
                  <Form.Label>Teammate {number}</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="sm id"
                    onChange={(e) => {
                      sm_id[number - 1] = e.target.value;
                    }}
                  />
                </Form.Group>
                
              </>
            ))}
          </Form>
        ) : null}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={() => displayRazorpay(props.user)}>Ok</Button>
        <Button onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}

// function App() {
//   const [modalShow, setModalShow] = React.useState(false);

//   return (
//     <>
//       <Button variant="primary" onClick={() => setModalShow(true)}>
//         Launch vertically centered modal
//       </Button>

//       <MyVerticallyCenteredModal
//         show={modalShow}
//         onHide={() => setModalShow(false)}
//       />
//     </>
//   );
// }

export default MyVerticallyCenteredModal;
