const Storage = require('./../services/storage');

class Sort {
  constructor() {}

  async stats(data, stats) {
    const { type, timeline } = stats;

    try {
      // CGet and compute the current timestamp
      const currentTimestamp = Math.round(new Date().getTime() / 1000);

      // Generate the filename for this stats
      const filename = [type, timeline].join('-').replace('_', '-');

      // Retrieve it
      const storedStats = await this._getStoredStats(filename);

      // Sort the data
      const newStatsData = this._sortArrayData(data);
      const oldStatsData = this._sortArrayData(storedStats);

      let updatedStats = [];
      let returningStats = [];
      Object.keys(newStatsData).forEach((id, index) => {
        // So we can easily access the content
        const stat = newStatsData[id];

        // Compute the rank
        let rank = index + 1;
        let previousRank = 0;
        let state = 'none';
        let change = 0;
        let timestamp = currentTimestamp;

        // Check if the incoming data is already existing
        if (oldStatsData[id]) {
          if (oldStatsData[id].rank === rank) {
            previousRank = oldStatsData[id].previousRank;
          } else {
            previousRank = oldStatsData[id].rank;
          }
        } else {
          // This is a new data
          state = 'new';
        }

        // Let's check if there's a change in the rank
        if (previousRank === 0) {
          state = 'new';
        } else {
          if (rank !== previousRank) {
            // There' a change in its rank
            // Compute
            if (previousRank > rank) {
              state = 'up';
              change = previousRank - rank;
            }

            if (previousRank < rank) {
              state = 'down';
              change = rank - previousRank;
            }
          }
        }

        // console.log(id, rank, previousRank, state, change);

        // Push data to be stored for comparison later
        updatedStats.push({
          id: stat.id,
          rank,
          previousRank,
          timestamp,
        });

        // Push data to display
        returningStats.push({
          ...stat,
          rank,
          previousRank,
          change,
          state,
        });
      });

      // Store the updated
      const storage = new Storage(filename);
      await storage.store(JSON.stringify(updatedStats));

      // Return the stats we're going to show
      return returningStats;
    } catch (error) {
      throw error;
    }
  }

  async _getStoredStats(filename) {
    // Retrieve it from the storage
    try {
      const storage = new Storage(filename);
      const content = await storage.get();

      return content && content.length > 0 ? JSON.parse(content) : [];
    } catch (error) {
      return [];
    }
  }

  _sortArrayData(array, indexedId = true) {
    const newArray = [];

    if (!array || array.length < 1) {
      return [];
    }

    if (indexedId) {
      array.forEach((a) => {
        newArray[a.id] = a;
      });
    } else {
      Object.keys(array).forEach((a) => {
        newArray.push(a);
      });
    }

    return newArray;
  }
}

module.exports = Sort;