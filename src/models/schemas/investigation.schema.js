const { z } = require('zod');

const createInvestigationSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  priority: z.enum(['low', 'medium', 'high'], {
    errorMap: () => ({ message: 'Priority must be low, medium, or high' })
  }),
  deadline: z.string().refine(
    (date) => {
      // Validate yyyy-mm-dd format
      const regex = /^(\d{4})-(\d{2})-(\d{2})$/;
      if (!regex.test(date)) return false;
      
      // Parse the date components
      const [, year, month, day] = date.match(regex);
      const yearNum = parseInt(year, 10);
      const monthNum = parseInt(month, 10);
      const dayNum = parseInt(day, 10);
      
      // Check if date is valid
      const dateObj = new Date(yearNum, monthNum - 1, dayNum);
      return dateObj.getDate() === dayNum && 
             dateObj.getMonth() === monthNum - 1 && 
             dateObj.getFullYear() === yearNum;
    },
    { message: 'Deadline must be in yyyy-mm-dd format' }
  ),
  budget: z.string().refine(
    (val) => !isNaN(parseInt(val, 10)) && parseInt(val, 10) >= 0,
    { message: 'Budget must be a positive number' }
  ).transform((val) => parseInt(val, 10))
});

const updateInvestigationSchema = z.object({
  status: z.enum(['pending', 'accepted', 'completed', 'cancelled'], {
    errorMap: () => ({ message: 'Invalid status' })
  }).optional(),
  notes: z.string().optional(),
  completionDate: z.string().datetime('Invalid completion date').optional()
});

module.exports = {
  createInvestigationSchema,
  updateInvestigationSchema
}; 