function showFormConfirmation(event) {
  event.preventDefault();
  const form = document.getElementById("checkout-form");
  const formData = new FormData(form);

  fetch("/users/cart/checkout", {
    method: "POST",
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    if (formData.get("paymentMethod") === "RazorPay") {
      const order = JSON.parse(data.order);
      var options = {
        key: "<%= process.env.RAZORPAY_KEYID %>", 
        amount: order.amount,
        currency: "INR",
        name: "LAP4YOU",
        description: "Order Payment",
        order_id: data.order.id,
        handler: function (response) {
          fetch("/users/cart/checkout/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response)
          })
          .then(res => res.json())
          .then(result => {
            if (result.success) {
              window.location.href = "/users/cart/checkout/<%= req.session.transactionID %>";
            } else {
              Swal.fire("Payment failed!", result.error, "error");
            }
          });
        },
        prefill: {
          name: "<%= req.session.userName %>",
          email: "<%= req.session.email %>",
        }
      };
      var rzp1 = new Razorpay(options);
      rzp1.open();
    } else {
      // COD
      window.location.href = data.redirect;
    }
  });
}
