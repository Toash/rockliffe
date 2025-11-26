<script setup>
import { ref } from "vue";

const apiBase = "http://localhost:4000/api";

const employeeId = ref("");
const password = ref("");
const employee = ref(null);
const error = ref("");

const orders = ref([]);
const selectedOrderId = ref(null);
const orderDetails = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const totalPages = ref(0);
const totalOrders = ref(0);

async function login() {
  error.value = "";
  try {
    const res = await fetch(`${apiBase}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId: Number(employeeId.value),
        password: password.value,
      }),
    });

    if (!res.ok) {
      throw new Error("Invalid employee ID or password");
    }

    const data = await res.json();
    employee.value = data;
    await loadOrders();
  } catch (e) {
    error.value = e.message;
  }
}

async function loadOrders(page = 1) {
  currentPage.value = page;
  const res = await fetch(
    `${apiBase}/orders?employeeId=${employee.value.employeeId}&page=${page}&limit=${pageSize.value}`
  );
  const data = await res.json();
  orders.value = data.orders;
  totalPages.value = data.pagination.totalPages;
  totalOrders.value = data.pagination.total;
  selectedOrderId.value = null;
  orderDetails.value = [];
}

function goToPage(page) {
  if (page >= 1 && page <= totalPages.value) {
    loadOrders(page);
  }
}

async function selectOrder(orderId) {
  selectedOrderId.value = orderId;
  const res = await fetch(`${apiBase}/orders/${orderId}/details`);
  orderDetails.value = await res.json();
}
</script>

<template>
  <div>
    <!-- Login -->
    <section
      style="
        padding: 1.5rem;
        border-radius: 0.75rem;
        background: rgba(15, 23, 42, 0.9);
        border: 1px solid rgba(148, 163, 184, 0.4);
        margin-bottom: 1.5rem;
      "
    >
      <h2 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 0.75rem">
        Employee Login
      </h2>

      <div
        style="
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          align-items: flex-end;
        "
      >
        <div style="display: flex; flex-direction: column">
          <label>Employee ID</label>
          <input
            v-model="employeeId"
            type="number"
            style="padding: 0.4rem 0.6rem; border-radius: 0.5rem"
          />
        </div>

        <div style="display: flex; flex-direction: column">
          <label>Password</label>
          <input
            v-model="password"
            type="password"
            style="padding: 0.4rem 0.6rem; border-radius: 0.5rem"
          />
        </div>

        <button
          @click="login"
          style="
            padding: 0.5rem 1rem;
            border-radius: 999px;
            border: none;
            cursor: pointer;
            font-weight: 600;
          "
        >
          Log in
        </button>
      </div>

      <p v-if="employee" style="margin-top: 0.75rem; opacity: 0.8">
        Logged in as {{ employee.name }} (ID {{ employee.employeeId }})
      </p>

      <p v-if="error" style="margin-top: 0.75rem; color: #fecaca">
        {{ error }}
      </p>
    </section>

    <!-- Orders table -->
    <section v-if="employee">
      <h3 style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem">
        Orders ({{ totalOrders }} total)
      </h3>
      <table
        style="
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 1rem;
          font-size: 0.9rem;
        "
      >
        <thead style="background: #020617">
          <tr>
            <th style="text-align: left; padding: 0.4rem">Order ID</th>
            <th style="text-align: left; padding: 0.4rem">Customer</th>
            <th style="text-align: left; padding: 0.4rem">Order Date</th>
            <th style="text-align: left; padding: 0.4rem">Ship Country</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="o in orders"
            :key="o.OrderID"
            @click="selectOrder(o.OrderID)"
            style="cursor: pointer"
          >
            <td style="padding: 0.4rem">{{ o.OrderID }}</td>
            <td style="padding: 0.4rem">{{ o.CustomerID }}</td>
            <td style="padding: 0.4rem">{{ o.OrderDate }}</td>
            <td style="padding: 0.4rem">{{ o.ShipCountry }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination controls -->
      <div
        v-if="totalPages > 1"
        style="
          display: flex;
          gap: 0.5rem;
          align-items: center;
          justify-content: center;
          margin-top: 1rem;
        "
      >
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          style="
            padding: 0.4rem 0.8rem;
            border-radius: 0.5rem;
            border: 1px solid rgba(148, 163, 184, 0.4);
            background: rgba(15, 23, 42, 0.9);
            cursor: pointer;
            font-weight: 500;
          "
          :style="
            currentPage === 1
              ? 'opacity: 0.5; cursor: not-allowed;'
              : 'cursor: pointer;'
          "
        >
          Previous
        </button>

        <span style="padding: 0 0.5rem">
          Page {{ currentPage }} of {{ totalPages }}
        </span>

        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          style="
            padding: 0.4rem 0.8rem;
            border-radius: 0.5rem;
            border: 1px solid rgba(148, 163, 184, 0.4);
            background: rgba(15, 23, 42, 0.9);
            cursor: pointer;
            font-weight: 500;
          "
          :style="
            currentPage === totalPages
              ? 'opacity: 0.5; cursor: not-allowed;'
              : 'cursor: pointer;'
          "
        >
          Next
        </button>
      </div>
    </section>

    <!-- Order details -->
    <section v-if="selectedOrderId">
      <h3 style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem">
        Order #{{ selectedOrderId }} – Products
      </h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem">
        <thead style="background: #020617">
          <tr>
            <th style="text-align: left; padding: 0.4rem">Product</th>
            <th style="text-align: left; padding: 0.4rem">Quantity</th>
            <th style="text-align: left; padding: 0.4rem">Unit Price</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in orderDetails" :key="d.ProductName">
            <td style="padding: 0.4rem">{{ d.ProductName }}</td>
            <td style="padding: 0.4rem">{{ d.Quantity }}</td>
            <td style="padding: 0.4rem">{{ d.UnitPrice }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>
