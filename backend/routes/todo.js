import express from 'express';
const router = express.Router();
import prisma from '../db/index.js';

router.get('/', async (req, res) => {
    try {
        // Gets all the todos from the database
        const todos = await prisma.todo.findMany();

        // Responds back to the client with the json with a success status and the todos array
        res.status(200).json({
            success: true,
            todos,
        });
    } catch (e) {
        console.log('Failed to GET todos:', e);
        res.status(500).json({
            success: false,
            message: 'Something went wrong while fetching todos',
        });
    }
});

// Define a POST route for creating a new todo
router.post('/', async (req, res) => {
    // Destructure `name` and `description` from the request body
    const { name, description } = req.body;

    // Validate request body
    if (!name || typeof name !== 'string') {
        return res.status(400).json({
            success: false,
            message: "Invalid or missing 'name'",
        });
    }

    try {
        // Use Prisma to create a new todo entry in the database
        const newTodo = await prisma.todo.create({
            data: {
                name, // Set the name of the todo from the request
                description, // Set the description of the todo from the request
                completed: false, // Default value for 'completed` is set to false
                userId: req.user.sub, // Assign the user ID
            },
        });

        //  Check if the new todo was created successfully
        if (newTodo) {
            res.status(201).json({
                success: true,
                todo: newTodo.id,
            });
        } else {
            // Respond with a failure status if todo creation failed
            res.status(500).json({
                success: false,
                message: 'Failed to create a new todo',
            });
        }
    } catch (e) {
        // Log the error for debugging purposes
        console.log('Failed to POST todo:', e);

        res.status(500).json({
            success: false,
            message: 'Something went wrong, please try again later',
        });
    }
});

// Define a PUT route for marking a todo as completed
router.put('/:todoId/completed', async (req, res) => {
    // Extract the `todoId` from the route parameter and convert it to a number
    const todoId = Number(req.params.todoId);

    if (isNaN(todoId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid todo ID',
        });
    }

    try {
        // Use Prisma to update the todo with the specified ID
        const updatedTodo = await prisma.todo.update({
            where: {
                id: todoId, // Match the todo based on its unique ID
            },
            data: {
                completed: true, // Update the `completed` field to true
            },
        });

        // Respond with a success status and include the updated todo's ID
        res.status(200).json({
            success: true,
            todo: updatedTodo.id,
        });
    } catch (e) {
        console.log('Failed to PUT todo:', e);
        // Handle any errors that occur during the update
        res.status(500).json({
            success: false,
            message: 'Something went wrong, please try again later',
        });
    }
});

// Define a DELETE route for removing a todo by its ID
router.delete('/:todoId', async (req, res) => {
    // Extract the `todoId` from the route parameter and convert it to a number
    const todoId = Number(req.params.todoId);

    // Validate todoId
    if (isNaN(todoId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid todo ID',
        });
    }

    try {
        // Check if todo exists and belongs to the users
        const todo = await prisma.todo.findUnique({
            where: { id: todoId },
        });

        if (!todo || !todo.completed) {
            return res.status(400).json({
                success: false,
                message: 'Only completed todos can be deleted',
            });
        }

        await prisma.todo.delete({
            where: { id: todoId },
        });

        // Respond with a success status and confirmation of the deletion
        res.status(200).json({
            success: true,
            todo: todoId, // Return the deleted todo's ID for reference
        });
    } catch (e) {
        // Handle any errors that occur during the deletion process
        res.status(500).json({
            success: false,
            message: 'Something went wrong, please try again later',
        });
    }
});

export default router;
