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
const pageSize = ref(5);
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
  <div style="max-width: 1200px; margin: 0 auto; padding: 2rem; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1f2937;">
    <!-- Login -->
    <section
      v-if="!employee"
      style="
        padding: 2.5rem;
        border-radius: 8px;
        background: #ffffff;
        border: 1px solid #e5e7eb;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        margin-bottom: 2rem;
      "
    >
      <h2 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 1.5rem; color: #111827;">
        Employee Login
      </h2>

      <div
        style="
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
          align-items: flex-end;
        "
      >
        <div style="display: flex; flex-direction: column; flex: 1; min-width: 200px;">
          <label style="font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
            Employee ID
          </label>
          <input
            v-model="employeeId"
            type="number"
            @keyup.enter="login"
            style="
              padding: 0.625rem 0.75rem;
              border-radius: 6px;
              border: 1px solid #d1d5db;
              font-size: 0.875rem;
              transition: border-color 0.2s, box-shadow 0.2s;
            "
            @focus="$event.target.style.borderColor = '#3b82f6'; $event.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'"
            @blur="$event.target.style.borderColor = '#d1d5db'; $event.target.style.boxShadow = 'none'"
          />
        </div>

        <div style="display: flex; flex-direction: column; flex: 1; min-width: 200px;">
          <label style="font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;">
            Password
          </label>
          <input
            v-model="password"
            type="password"
            @keyup.enter="login"
            style="
              padding: 0.625rem 0.75rem;
              border-radius: 6px;
              border: 1px solid #d1d5db;
              font-size: 0.875rem;
              transition: border-color 0.2s, box-shadow 0.2s;
            "
            @focus="$event.target.style.borderColor = '#3b82f6'; $event.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'"
            @blur="$event.target.style.borderColor = '#d1d5db'; $event.target.style.boxShadow = 'none'"
          />
        </div>

        <button
          @click="login"
          style="
            padding: 0.625rem 1.5rem;
            border-radius: 6px;
            border: none;
            background: #2563eb;
            color: white;
            font-weight: 500;
            font-size: 0.875rem;
            cursor: pointer;
            transition: background-color 0.2s;
            height: fit-content;
          "
          @mouseover="$event.target.style.background = '#1d4ed8'"
          @mouseout="$event.target.style.background = '#2563eb'"
        >
          Sign In
        </button>
      </div>

      <p v-if="error" style="margin-top: 1rem; color: #dc2626; font-size: 0.875rem; padding: 0.75rem; background: #fef2f2; border-radius: 6px; border: 1px solid #fecaca;">
        {{ error }}
      </p>
    </section>

    <!-- User info bar -->
    <div
      v-if="employee"
      style="
        padding: 1rem 1.5rem;
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        margin-bottom: 2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      "
    >
      <div>
        <span style="font-size: 0.875rem; color: #6b7280;">Logged in as</span>
        <span style="font-weight: 600; color: #111827; margin-left: 0.5rem;">{{ employee.name }}</span>
        <span style="font-size: 0.875rem; color: #9ca3af; margin-left: 0.5rem;">(ID: {{ employee.employeeId }})</span>
      </div>
      <button
        @click="employee = null; orders = []; selectedOrderId = null; orderDetails = []; employeeId = ''; password = ''; error = ''"
        style="
          padding: 0.5rem 1rem;
          border-radius: 6px;
          border: 1px solid #d1d5db;
          background: white;
          color: #374151;
          font-size: 0.875rem;
          cursor: pointer;
          transition: background-color 0.2s;
        "
        @mouseover="$event.target.style.background = '#f9fafb'"
        @mouseout="$event.target.style.background = 'white'"
      >
        Sign Out
      </button>
    </div>

    <!-- Orders table -->
    <section v-if="employee">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h3 style="font-size: 1.25rem; font-weight: 600; color: #111827;">
          Orders
        </h3>
        <span style="font-size: 0.875rem; color: #6b7280;">
          {{ totalOrders }} total
        </span>
      </div>
      
      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);">
        <table
          style="
            width: 100%;
            border-collapse: collapse;
            font-size: 0.875rem;
          "
        >
          <thead>
            <tr style="background: #f9fafb; border-bottom: 2px solid #e5e7eb;">
              <th style="text-align: left; padding: 0.75rem 1rem; font-weight: 600; color: #374151; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">
                Order ID
              </th>
              <th style="text-align: left; padding: 0.75rem 1rem; font-weight: 600; color: #374151; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">
                Customer
              </th>
              <th style="text-align: left; padding: 0.75rem 1rem; font-weight: 600; color: #374151; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">
                Order Date
              </th>
              <th style="text-align: left; padding: 0.75rem 1rem; font-weight: 600; color: #374151; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">
                Shipped Date
              </th>
              <th style="text-align: left; padding: 0.75rem 1rem; font-weight: 600; color: #374151; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">
                Ship Country
              </th>
              <th style="text-align: right; padding: 0.75rem 1rem; font-weight: 600; color: #374151; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">
                Freight
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="o in orders"
              :key="o.OrderID"
              @click="selectOrder(o.OrderID)"
              style="
                cursor: pointer;
                border-bottom: 1px solid #f3f4f6;
                transition: background-color 0.15s;
              "
              @mouseover="$event.currentTarget.style.background = '#f9fafb'"
              @mouseout="$event.currentTarget.style.background = 'white'"
            >
              <td style="padding: 0.875rem 1rem; color: #111827; font-weight: 500;">{{ o.OrderID }}</td>
              <td style="padding: 0.875rem 1rem; color: #374151;">{{ o.CustomerID }}</td>
              <td style="padding: 0.875rem 1rem; color: #374151;">{{ o.OrderDate || '—' }}</td>
              <td style="padding: 0.875rem 1rem; color: #374151;">{{ o.ShippedDate || '—' }}</td>
              <td style="padding: 0.875rem 1rem; color: #374151;">{{ o.ShipCountry }}</td>
              <td style="padding: 0.875rem 1rem; color: #374151; text-align: right;">${{ o.Freight ? parseFloat(o.Freight).toFixed(2) : '0.00' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination controls -->
      <div
        v-if="totalPages > 1"
        style="
          display: flex;
          gap: 0.75rem;
          align-items: center;
          justify-content: center;
          margin-top: 1.5rem;
        "
      >
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          style="
            padding: 0.5rem 1rem;
            border-radius: 6px;
            border: 1px solid #d1d5db;
            background: white;
            color: #374151;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
          "
          :style="
            currentPage === 1
              ? 'opacity: 0.5; cursor: not-allowed;'
              : ''
          "
          @mouseover="currentPage !== 1 && ($event.target.style.background = '#f9fafb')"
          @mouseout="currentPage !== 1 && ($event.target.style.background = 'white')"
        >
          Previous
        </button>

        <span style="padding: 0 0.75rem; font-size: 0.875rem; color: #6b7280;">
          Page {{ currentPage }} of {{ totalPages }}
        </span>

        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          style="
            padding: 0.5rem 1rem;
            border-radius: 6px;
            border: 1px solid #d1d5db;
            background: white;
            color: #374151;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
          "
          :style="
            currentPage === totalPages
              ? 'opacity: 0.5; cursor: not-allowed;'
              : ''
          "
          @mouseover="currentPage !== totalPages && ($event.target.style.background = '#f9fafb')"
          @mouseout="currentPage !== totalPages && ($event.target.style.background = 'white')"
        >
          Next
        </button>
      </div>
    </section>

    <!-- Order details -->
    <section v-if="selectedOrderId" style="margin-top: 2rem;">
      <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem; color: #111827;">
        Order #{{ selectedOrderId }} – Products
      </h3>
      
      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);">
        <table style="width: 100%; border-collapse: collapse; font-size: 0.875rem;">
          <thead>
            <tr style="background: #f9fafb; border-bottom: 2px solid #e5e7eb;">
              <th style="text-align: left; padding: 0.75rem 1rem; font-weight: 600; color: #374151; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">
                Product
              </th>
              <th style="text-align: right; padding: 0.75rem 1rem; font-weight: 600; color: #374151; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">
                Quantity
              </th>
              <th style="text-align: right; padding: 0.75rem 1rem; font-weight: 600; color: #374151; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">
                Unit Price
              </th>
              <th style="text-align: right; padding: 0.75rem 1rem; font-weight: 600; color: #374151; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">
                Discount
              </th>
              <th style="text-align: right; padding: 0.75rem 1rem; font-weight: 600; color: #374151; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">
                Line Total
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="d in orderDetails"
              :key="d.ProductName"
              style="border-bottom: 1px solid #f3f4f6;"
            >
              <td style="padding: 0.875rem 1rem; color: #111827;">{{ d.ProductName }}</td>
              <td style="padding: 0.875rem 1rem; color: #374151; text-align: right;">{{ d.Quantity }}</td>
              <td style="padding: 0.875rem 1rem; color: #374151; text-align: right;">${{ parseFloat(d.UnitPrice).toFixed(2) }}</td>
              <td style="padding: 0.875rem 1rem; color: #374151; text-align: right;">{{ (parseFloat(d.Discount) * 100).toFixed(1) }}%</td>
              <td style="padding: 0.875rem 1rem; color: #111827; font-weight: 500; text-align: right;">${{ parseFloat(d.LineTotal).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
