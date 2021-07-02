"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  // if(currentUser)?
  storyList.checkFavorites();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);
  // if (storyList.checkFavorites())

  const hostName = story.getHostName();
  // add empty star, once clicked, fill the star
  let favorited = story.favorite ? "fas" : "far";

  return $(`
      <li id="${story.storyId}">
        <i class="${favorited} fa-star" id="star-btn"></i>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

$allStoriesList.on("click", "#star-btn", function (e) {
  {
    $(e.target).toggleClass("fas");
    $(e.target).toggleClass("far");

    if ($(e.target).hasClass("fas")) {
      console.log($(e.target).parent().attr("id"));
      addFavorite($(e.target).parent().attr("id"));
    } else {
      removeFavorite($(e.target).parent().attr("id"));
    }
  }
});

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/**
 * Sending data to server-side from new story form and prepend new story to DOM
 */
async function putNewStoryOnPage(evt) {
  evt.preventDefault();
  let author = $("#author").val();
  let title = $("#title").val();
  let url = $("#url").val();

  let newStory = await storyList.addStory(currentUser, {
    author,
    title,
    url,
  });

  //hide the form once submited
  $newStoryForm.hide();

  //update story list in DOM
  $allStoriesList.prepend(generateStoryMarkup(newStory));
}

$("#submit-new-story").on("click", putNewStoryOnPage);

async function addFavorite(storyId) {
  let user = localStorage.username;
  let token = localStorage.token;

  let response = await axios.post(
    `${BASE_URL}/users/${user}/favorites/${storyId}?token=${token}`
  );
  console.log("add", response);
}

async function removeFavorite(storyId) {
  let user = localStorage.username;
  let token = localStorage.token;

  let response = await axios.delete(
    `${BASE_URL}/users/${user}/favorites/${storyId}?token=${token}`
  );
  console.log("delete", response);
}
