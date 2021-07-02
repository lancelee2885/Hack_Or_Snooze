"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  storyList.checkFavorites();
  $favoritesList.hide();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/**
 * When "Submit" is clicked in navbar, show a form to generate a new story
 */
function displayNewStoryForm() {
  $("#new-story-form").show();
  putStoriesOnPage();
}

$navSubmit.on("click", displayNewStoryForm);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

/**
 * display the list of favorite stories and also hide everything except nav bar.
 */

function displayFavoritesList() {
  $favoritesList.empty();
  hidePageComponents();
  generateFavoritesMarkUp();
  $favoritesList.show();
}

$navFavorites.on("click", displayFavoritesList);
