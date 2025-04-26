exports.dummyHostData = {
  name: "Sam Doe",
  profileImage: "/images/avatar-2.png",
  isVerified: true,
  rating: 4.8,
  reviews: 120,
  stays: 500,
  description:
    "Passionate about providing great experiences for my guests. I've been hosting for 5 years and love meeting people from around the world.",
  joinDate: "2018",
  responseRate: 99,
  responseTime: "within an hour",
};

exports.dummyReviewsData = {
  totalReviews: 120,
  averageRating: 4.8,
  reviews: [
    {
      id: 1,
      user: "Alice Smith",
      avatar: "/images/avatar-1.png",
      rating: 5,
      date: "August 2023",
      content:
        "Wonderful stay! The host was very accommodating and the place was spotless.",
    },
    {
      id: 2,
      user: "Bob Johnson",
      avatar: "/images/avatar-2.png",
      rating: 4,
      date: "July 2023",
      content:
        "Great location and comfortable beds. Could use a bit more kitchen equipment.",
    },
    {
      id: 3,
      user: "Carol Williams",
      avatar: "/images/avatar-3.png",
      rating: 5,
      date: "June 2023",
      content:
        "Absolutely loved our stay here. The host went above and beyond to make us feel welcome.",
    },
  ],
  remainingReviews: 117,
};
exports.dummyPropertyData = {
  latitute: 15.2993,
  longitude: 74.124,
};
