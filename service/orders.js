
const { randomUUID } = require("node:crypto");
const store = require("../store/orders");

const DEFAULT_ORDER_STATUS = "created";

function validateCreateOrder(body) {
  const problems = [];

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    problems.push("Request body must be a JSON object");
    return problems;
  }

  if (
    typeof body.customerName !== "string" ||
    body.customerName.trim().length === 0
  ) {
    problems.push("customerName is required");
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    problems.push("At least one item is required");
    return problems;
  }

  body.items.forEach((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      problems.push(`items[${index}] must be an object`);
      return;
    }

    if (typeof item.name !== "string" || item.name.trim().length === 0) {
      problems.push(`items[${index}].name is required`);
    }
    if (
      typeof item.quantity !== "number" ||
      !Number.isFinite(item.quantity) ||
      item.quantity <= 0
    ) {
      problems.push(`items[${index}].quantity must be greater than zero`);
    }
    if (
      typeof item.price !== "number" ||
      !Number.isFinite(item.price) ||
      item.price <= 0
    ) {
      problems.push(`items[${index}].price must be greater than zero`);
    }
  });

  return problems;
}

function validationProblem(message, details) {
  return { error: { code: "VALIDATION_ERROR", message, details } };
}

function notFoundProblem() {
  return { error: { code: "ORDER_NOT_FOUND", message: "Order not found" } };
}

function calculateTotal(items) {
  const sum = items.reduce(
    (total, item) => total + item.quantity * item.price, 0
  );
  return Math.round((sum + Number.EPSILON) * 100) / 100;
}

function createOrder(body) {
  const items = body.items.map((item) => ({
    name: item.name.trim(),
    quantity: item.quantity,
    price: item.price,
  }));

  const order = {
    id: `ord-${randomUUID().slice(0, 8)}`,
    customerName: body.customerName.trim(),
    items,
    total: calculateTotal(items),
    status: DEFAULT_ORDER_STATUS,
    createdAt: new Date().toISOString(),
  };

  store.add(order);
  return order;
}

function orderResponse(order) {
  return {
    id: order.id,
    customerName: order.customerName,
    items: order.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    })),
    total: order.total,
    status: order.status,
  };
}

function listOrders() {
  return store.list();
}

function getOrder(id) {
  return store.findById(id);
}

function removeOrder(id) {
  return store.removeById(id);
}

module.exports = {
  validateCreateOrder,
  validationProblem,
  notFoundProblem,
  createOrder,
  orderResponse,
  listOrders,
  getOrder,
  removeOrder,
};
