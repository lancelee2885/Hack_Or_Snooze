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
  return $(`
      <li id="${story.storyId}">
        <span class="far fa-star" id="star-btn"></span>
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
  if (e.target.className === "far fa-star") {
    e.target.className = "fas fa-star";
  } else {
    e.target.className = "far fa-star"
  }
})

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
    url
  });

  //hide the form once submited
  $newStoryForm.hide();

  //update story list in DOM
  $allStoriesList.prepend(generateStoryMarkup(newStory));
}

$("#submit-new-story").on("click", putNewStoryOnPage);
