
const express = require("express");
const service = require("../service/orders");

const router = express.Router();

router.post("/", (req, res) => {
  const problems = service.validateCreateOrder(req.body);

  if (problems.length > 0) {
    return res
      .status(400)
      .json(service.validationProblem("Invalid order", problems));
  }

  const order = service.createOrder(req.body);

  return res
    .status(201)
    .location(`/orders/${order.id}`)
    .json(service.orderResponse(order));
});

router.get("/", (req, res) => {
  const orders = service.listOrders().map(service.orderResponse);
  return res.status(200).json({ orders, count: orders.length });
});

router.get("/:id", (req, res) => {
  const order = service.getOrder(req.params.id);

  if (!order) {
    return res.status(404).json(service.notFoundProblem());
  }

  return res.status(200).json(service.orderResponse(order));
});

router.delete("/:id", (req, res) => {
  if (!service.removeOrder(req.params.id)) {
    return res.status(404).json(service.notFoundProblem());
  }

  return res.status(204).send();
});

module.exports = router;
