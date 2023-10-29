function createQuery() {
    let query;

    if (filters === "all") {
      if (categories.length === 0) {
        if (interests === "all") {
          // Show all accessible posts
          query = {
            $or: [
              { public: true },
              {
                authorUsername: { $in: req.user.friends },
              },
            ],
          };
        } else {
          // Show all posts in user's interests
          query = {
            $and: [
              { category: { $in: req.user.interests } },
              {
                $or: [
                  { public: true },
                  {
                    authorUsername: { $in: req.user.friends },
                  },
                ],
              },
            ],
          };
        }
      } else {
        // Show all but user specified some categories
        query = {
          $and: [
            {
              $or: [
                { public: true },
                {
                  authorUsername: { $in: req.user.friends },
                },
              ],
            },
            { category: { $in: categories } },
          ],
        };
      }
    } else {
      if (categories.length === 0) {
        // Show only friends posts
        if (interests === "all") {
          // Show all posts of friends:
          query = {
            authorUsername: { $in: req.user.friends },
          };
        } else {
          // Show all posts of friends which is in user's interest categories:
          query = {
            $and: [
              { authorUsername: { $in: req.user.friends } },
              { category: { $in: req.user.interests } },
            ],
          };
        }
      } else {
        // Show only friends posts with the given categories
        query = {
          $and: [
            {
              authorUsername: { $in: req.user.friends },
            },

            { category: { $in: categories } },
          ],
        };
      }
    }
    return query;
  }