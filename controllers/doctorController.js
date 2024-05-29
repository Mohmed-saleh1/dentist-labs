const { uploadMixOfImages } = require("../middlewares/imagesAndFilesProcess");
const { Order } = require("../models/order.model");
const { User } = require("../models/user.model");
const { genUIDOrder } = require("../utils/genUIDOrder");

exports.uploadOrderImgsAndFiles = uploadMixOfImages([
  {
    name: "image",
    maxCount: 1,
  },
  {
    name: "file",
    maxCount: 1,
  },
  {
    name: "video",
    maxCount: 1,
  },
]);
exports.createOrderController = async (req, res, next) => {
  try {
    // Find the user and populate the labId field
    const user = await User.findById(req.userId).populate("labId");
    if (!user.labId) {
      return res
        .status(400)
        .json({ message: "Doctor Not Registered On A Lab" });
    }

    // Generate a unique ID for the order
    const UID = await genUIDOrder(Order);

    // Calculate the price
    const price = req.body.teethNo * user.labContract[req.body.type];
    console.log(price);
    // Create a new order instance
    const order = new Order({
      UID,
      patientName: req.body.patientName,
      age: req.body.age,
      teethNo: req.body.teethNo,
      sex: req.body.sex,
      color: req.body.color,
      type: req.body.type,
      description: req.body.description,
      screen: req.body.screen,
      price: price,
      paid: 0,
      lab_id: user.labId._id,
      doc_id: user._id,
      images: req.body.images,
      file: req.body.file,
      video: req.body.video,
    });
    if (order.file) {
      order.status = "UNDERWAY(P)";
    } else {
      order.status = "DocReady(P)";
    }
    // Save the order to the database
    await order.save();
    res.status(200).json({ data: order });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "INTERNAL SERVER ERROR" });
  }
};

exports.editOrderController = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!order) {
      return res.status(404).json("Order Not Found");
    }
    if (order.status == "END(F)") {
      return res.status(400).json("Can't Order Ended Orders");
    }
    const user = await User.findById(req.userId);
    if (order.prova) {
      order.status = "DocReady(F)";
    }
    if (order.file) {
      order.status = "LabReady(F)";
    }
    return res.status(200).json(order);
  } catch (error) {
    console.log(error);
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
};

exports.getOrdersController = async (req, res) => {
  try {
    const orders = await Order.find({ doc_id: req.userId });
    if (!orders) {
      return res.status(404).json("No Orders Found");
    }
    return res.status(200).json(orders);
  } catch (error) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
};

exports.getOrderByIdController = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json("No Orders Found");
    }
    return res.status(200).json(order);
  } catch (error) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
};

exports.getProfitsController = async (req, res) => {
  try {
    const orders = await Order.find({ doc_id: req.userId, status: "END(F)" });
    if (!orders[0]) {
      return res.status(404).json("No Orders Available");
    }
    let orderQuantity = orders.length;
    const result = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalPrice: { $sum: "$price" },
          totalPaid: { $sum: "$paid" },
        },
      },
    ]);
    return res.status(200).json({
      orders: orderQuantity,
      totalPrice: result[0].totalPrice,
      totalPaid: result[0].totalPaid,
    });
  } catch (error) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
};
