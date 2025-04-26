const Newsletter = require('../models/Newsletter');

exports.subscribeToNewsletter = async (req, res) => {
  const { email } = req.body;

  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ message: 'Invalid email address.' });
  }

  try {
    const existingSubscription = await Newsletter.findOne({ email });
    if (existingSubscription) {
      return res.status(409).json({ message: 'Email is already subscribed.' });
    }

    const newSubscription = new Newsletter({ email });
    await newSubscription.save();

    res.status(201).json({ message: 'Successfully subscribed.' });
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};


exports.bulkSubscribeToNewsletter = async (req, res) => {
  const { emails } = req.body;

  if (!Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({ message: 'Invalid input. Provide an array of email addresses.' });
  }

  // Validate each email in the array
  const invalidEmails = emails.filter((email) => !/\S+@\S+\.\S+/.test(email));
  if (invalidEmails.length > 0) {
    return res.status(400).json({ message: 'Some email addresses are invalid.', invalidEmails });
  }

  try {
    // Filter out already subscribed emails
    const existingSubscriptions = await Newsletter.find({ email: { $in: emails } });
    const existingEmails = existingSubscriptions.map((sub) => sub.email);

    const newEmails = emails.filter((email) => !existingEmails.includes(email));
    if (newEmails.length === 0) {
      return res.status(409).json({ message: 'All emails are already subscribed.', existingEmails });
    }

    // Insert new emails
    const newSubscriptions = newEmails.map((email) => ({ email }));
    await Newsletter.insertMany(newSubscriptions);

    res.status(201).json({
      message: 'Successfully subscribed new emails.',
      subscribed: newEmails,
      alreadySubscribed: existingEmails,
    });
  } catch (error) {
    console.error('Error in bulk subscription:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};
