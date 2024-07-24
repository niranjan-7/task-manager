const Task = require('../models/Task');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

const createTask = async (req, res) => {
  try {
    const { name, creatorEmail, description, dueDate, priority, status, collaborators, viewers } = req.body;

    const task = new Task({
      name,
      description,
      dueDate,
      priority,
      status,
      creatorEmail,
      collaborators,
      viewers
    });

    await task.save();

    const notification = new Notification({
      message: `Task "${task.name}" created by "${task.creatorEmail}"`,
      taskId: task._id,
      users: [creatorEmail, ...collaborators, ...viewers]
    });
    await notification.save();


    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
};

const getTasks = async (req, res) => {
  try {
    // Extract query parameters
    const { name, creatorEmail, status, priority, dueDateLTE, associatedEmail,description } = req.query;

    // Construct filter object based on provided parameters
    const filters = {};
    if (name) filters.name = { $regex: new RegExp(name, 'i') }; // Case-insensitive search for name
    if (creatorEmail) filters.creatorEmail = creatorEmail;
    if (description) filters.description = description;
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (dueDateLTE) {
      filters.dueDate = { $lte: new Date(dueDateLTE) }; // Filter tasks with due date before the specified date
    }

    // Construct or query for associatedEmail
    if (associatedEmail) {
      filters.$or = [
        { creatorEmail: associatedEmail },
        { collaborators: associatedEmail },
        { viewers: associatedEmail }
      ];
    }

    // Fetch tasks based on filters
    const tasks = await Task.find(filters);

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error });
  }
};


const getTaskById = async (req, res) => {
  const { id } = req.params;

  try {
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching task', error });
  }
};

const updateTask = async (req, res) => {
  const { id } = req.params;
  const { name, description, creatorEmail, dueDate, priority, status, collaborators, viewers } = req.body;

  try {
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const updates = [];
    if (task.name !== name) updates.push({ field: 'name', oldValue: task.name, newValue: name });
    if (task.description !== description) updates.push({ field: 'description', oldValue: task.description, newValue: description });
    if (task.dueDate.toISOString() !== new Date(dueDate).toISOString()) updates.push({ field: 'due date', oldValue: task.dueDate.toISOString(), newValue: new Date(dueDate).toISOString() });
    if (task.priority !== priority) updates.push({ field: 'priority', oldValue: task.priority, newValue: priority });
    if (task.status !== status) updates.push({ field: 'status', oldValue: task.status, newValue: status });
    if (JSON.stringify(task.collaborators) !== JSON.stringify(collaborators)) updates.push({ field: 'collaborators', oldValue: task.collaborators.join(', '), newValue: collaborators.join(', ') });
    if (JSON.stringify(task.viewers) !== JSON.stringify(viewers)) updates.push({ field: 'viewers', oldValue: task.viewers.join(', '), newValue: viewers.join(', ') });

    const updatedViewers = viewers.filter(viewer => !collaborators.includes(viewer));

    task.name = name;
    task.description = description;
    task.dueDate = dueDate;
    task.priority = priority;
    task.status = status;
    task.collaborators = collaborators;
    task.viewers = updatedViewers;
    task.updatedAt = Date.now();

    await task.save();

    const notificationUsers = new Set([...collaborators, ...viewers]);
    if (!notificationUsers.has(creatorEmail)) {
      notificationUsers.add(creatorEmail);
    }
    if (!notificationUsers.has(task.creatorEmail)) {
      notificationUsers.add(task.creatorEmail);
    }

    const notification = new Notification({
      message: `Task "${task.name}" updated by "${creatorEmail}".`,
      taskId: task._id,
      users: Array.from(notificationUsers),
      updates: updates
    });

    await notification.save();

    
    res.status(200).json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Error updating task', error: error.message });
  }
};

const deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }

    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const notification = new Notification({ 
      message: `Task "${task.name}" deleted`,
      taskId: task._id,
      users: [...task.collaborators, ...task.viewers]
    });
    await notification.save();

    

    res.status(200).json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Error deleting task', error: error.message });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
