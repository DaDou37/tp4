const Joi = require('joi');

const taskSchema = Joi.object({
    title: Joi.string().trim().max(255).required(),
    completed: Joi.boolean().default(false),
    assignee: Joi.string().trim().max(50).allow(null, '').optional(),
});

module.exports = {
    taskSchema,
};