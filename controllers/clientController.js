const Client = require("../models/clientModel");
const Receipt = require("../models/receiptModel");
const asyncHandler = require("express-async-handler");

// @desc    Get all clients
// @route   GET /api/clients
// @access  Public
const getClients = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.pageSize) || 10;
  const page = Number(req.query.page) || 1;
  const sortBy = req.query.sortBy || "createdAt";
  const sortOrder = req.query.sortOrder || -1;

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder;

  const filter = {};
  if (req.query.active === "true") {
    filter.active = true;
  }

  const count = await Client.countDocuments(filter);
  const clients = await Client.find(filter)
    .sort(sortOptions)
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    clients,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

// @desc    Get client by ID
// @route   GET /api/clients/:id
// @access  Public
const getClientById = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);

  if (client) {
    res.json(client);
  } else {
    res.status(404);
    throw new Error("Client not found");
  }
});

// @desc    Create new client
// @route   POST /api/clients
// @access  Public
const createClient = asyncHandler(async (req, res) => {
  const { shopName, clientName, phoneNumber, address, email } = req.body;

  console.log("Creating new client:", req.body);

  // Validate required fields
  if (!clientName || clientName.trim() === "") {
    res.status(400);
    throw new Error("Client name is required");
  }

  try {
    // Check if client with same phone number already exists
    if (phoneNumber && phoneNumber.trim() !== "") {
      const clientExists = await Client.findOne({ phoneNumber });
      if (clientExists) {
        res.status(400);
        throw new Error("Client with this phone number already exists");
      }
    }

    const client = await Client.create({
      shopName: shopName || "",
      clientName,
      phoneNumber: phoneNumber || "",
      address: address || "",
      email: email || "",
    });

    if (client) {
      console.log("Client created successfully:", client);
      res.status(201).json(client);
    } else {
      res.status(400);
      throw new Error("Invalid client data");
    }
  } catch (error) {
    console.error("Error creating client:", error);
    res.status(500).json({
      message: `Failed to create client: ${error.message}`,
      stack: process.env.NODE_ENV === "production" ? null : error.stack,
    });
  }
});

// @desc    Update client
// @route   PUT /api/clients/:id
// @access  Public
const updateClient = asyncHandler(async (req, res) => {
  const { shopName, clientName, phoneNumber, address, email, active } =
    req.body;

  const client = await Client.findById(req.params.id);

  if (client) {
    // Check if another client has this phone number
    if (phoneNumber !== client.phoneNumber) {
      const phoneExists = await Client.findOne({ phoneNumber });
      if (phoneExists) {
        res.status(400);
        throw new Error("Phone number already used by another client");
      }
    }

    client.shopName = shopName || client.shopName;
    client.clientName = clientName || client.clientName;
    client.phoneNumber = phoneNumber || client.phoneNumber;
    client.address = address || client.address;
    client.email = email !== undefined ? email : client.email;
    client.active = active !== undefined ? active : client.active;

    const updatedClient = await client.save();

    // Update client info in all receipts
    if (shopName || clientName || phoneNumber) {
      await Receipt.updateMany(
        { clientId: client._id },
        {
          $set: {
            "clientInfo.shopName": updatedClient.shopName,
            "clientInfo.clientName": updatedClient.clientName,
            "clientInfo.phoneNumber": updatedClient.phoneNumber,
          },
        }
      );
    }

    res.json(updatedClient);
  } else {
    res.status(404);
    throw new Error("Client not found");
  }
});

// @desc    Delete client
// @route   DELETE /api/clients/:id
// @access  Public
const deleteClient = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);

  if (!client) {
    res.status(404);
    throw new Error("Client not found");
  }

  // First delete all receipts associated with this client
  await Receipt.deleteMany({ clientId: client._id });

  // Then delete the client
  await client.deleteOne();

  res.json({
    message: "Client and all associated receipts permanently deleted",
  });
});
// @desc    Search clients
// @route   GET /api/clients/search
// @access  Public
const searchClients = asyncHandler(async (req, res) => {
  const { query } = req.query;

  if (!query || query.length < 2) {
    res.status(400);
    throw new Error("Search query must be at least 2 characters");
  }

  const clients = await Client.find({
    $or: [
      { clientName: { $regex: query, $options: "i" } },
      { shopName: { $regex: query, $options: "i" } },
      { phoneNumber: { $regex: query, $options: "i" } },
    ],
  }).limit(20);

  res.json(clients);
});

// @desc    Get client stats
// @route   GET /api/clients/stats
// @access  Private
const getClientStats = asyncHandler(async (req, res) => {
  const totalClients = await Client.countDocuments();
  const activeClients = await Client.countDocuments({ active: true });

  // Clients with most receipts
  const topClients = await Receipt.aggregate([
    { $group: { _id: "$clientId", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "clients",
        localField: "_id",
        foreignField: "_id",
        as: "clientDetails",
      },
    },
    { $unwind: "$clientDetails" },
    {
      $project: {
        _id: 1,
        count: 1,
        clientName: "$clientDetails.clientName",
        shopName: "$clientDetails.shopName",
      },
    },
  ]);

  // New clients this month
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const newClients = await Client.countDocuments({
    createdAt: { $gte: thisMonth },
  });

  res.json({
    totalClients,
    activeClients,
    newClientsThisMonth: newClients,
    topClients,
  });
});

module.exports = {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  searchClients,
  getClientStats,
};
