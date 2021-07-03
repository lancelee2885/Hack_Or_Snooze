"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {
  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */

  constructor({
    storyId,
    title,
    author,
    url,
    username,
    createdAt,
    favorite = false,
  }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
    this.favorite = favorite;
  }

  /** Parses hostname out of URL and returns it. */

  getHostName(url) {
    //TODO: URL method here
    return url.split("//")[1].split("/")[0]; 
  }
}

/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method?

    // query the /stories endpoint (no auth required)
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    // turn plain old story objects from API into instances of Story class
    // returns an array
    const stories = response.data.stories.map((story) => new Story(story));

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }

  /** Adds story data to API, makes a Story instance, adds it to story list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */
  async addStory(user, newStory) {
    console.debug("addStory");
    let response = await axios.post(`${BASE_URL}/stories`, {
      token: `${user.loginToken}`,
      story: newStory,
    });

    let story = response.data.story;

    let addedStory = new Story({
      storyId: story.storyId,
      title: story.title,
      author: story.author,
      url: story.url,
      username: story.username,
      createdAt: story.createdAt,
    });

    this.stories.unshift(addedStory);

    return addedStory;
  }

  /**
   * check if story in story list has correct favorite property and updates when needed
   */
  //not only checking favorites but also mark 
  checkFavorites() {
    console.debug("checkFavorites");
    let storyIdArr = currentUser.favorites.map((fav) => fav.storyId);
    // TODO: for of loop will do the same
    for (let i = 0; i < this.stories.length; i++) {
      //TODO: this.stories[i].favorite = storyIdArr.includes(this.stories[i].storyId
      if (storyIdArr.includes(this.stories[i].storyId)) {
        this.stories[i].favorite = true;
      } else {
        this.stories[i].favorite = false;
      }
    }
  }
}

/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  constructor(
    { username, name, createdAt, favorites = [], ownStories = [] },
    token
  ) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map((s) => new Story({ ...s, favorite: true }));
    this.ownStories = ownStories.map((s) => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  static async signup(username, password, name) {
    // console.log(username, password, name);
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    });
    // console.log(response);
    let user = response.data.user;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories,
      },
      response.data.token
    );
  }

  /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    });

    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories,
      },
      response.data.token
    );
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */

  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      let { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories,
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }
  /**
Sends a post request to add a story to the user's favorites list on the server and updates current user's favorites list on client side
 */
  //TODO: use this.user, this.token .... because we are in User Class
  async addFavorite(storyId) {
    let user = localStorage.username;
    let token = localStorage.token;

    let response = await axios.post(
      `${BASE_URL}/users/${user}/favorites/${storyId}?token=${token}`
    );
    // Current user's favorites are updated based on server response
    //TODO: better to use "this" instead of currentUser
    currentUser.favorites = response.data.user.favorites.map(
      (fav) => new Story({ ...fav, favorite: true })
    );
  }
  /**
Sends a delete request to remove a story from the user's favorites list on the server and updates current user's favorites list on client side
 */
  async removeFavorite(storyId) {
    let user = localStorage.username;
    let token = localStorage.token;

    let response = await axios.delete(
      `${BASE_URL}/users/${user}/favorites/${storyId}?token=${token}`
    );

    // Current user's favorites are updated based on server response
    currentUser.favorites = response.data.user.favorites.map(
      (fav) => new Story({ ...fav, favorite: true })
    );
  }
}
