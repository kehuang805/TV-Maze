"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  let shows = await axios.get(`http://api.tvmaze.com/search/shows?q=${term}`);
  let showsArr = [];
  for (let { show } of shows.data) {
    let newShow = {
      id: show.id,
      name: show.name,
      summary: show.summary,
    };
    if (show.image != null) {
      newShow.image = show.image.original;
    } else {
      newShow.image = "https://tinyurl.com/tv-missing";
    }
    showsArr.push(newShow);
  }
  return showsArr;
}

/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();
  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src="${show.image}" 
              alt="" 
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `
    );

    $showsList.append($show);
  }
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  let episodes = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);
  let episodeArr = [];
  for (let episode of episodes.data) {
    let newEpisode = {
      id: episode.id,
      name: episode.name,
      season: episode.season,
      number: episode.number,
    };
    episodeArr.push(newEpisode);
  }
  return episodeArr;
}

/** Write a clear docstring for this function... */

function populateEpisodes(episodes) {
  $("#episodesList").text("");
  for (let episode of episodes) {
    const $episode = $(
      `<li> ${episode.name} (season ${episode.season}, number ${episode.number}) </li>`
    );

    $("#episodesList").append($episode);
  }
}

async function searchForEpisodesAndDisplay(id) {
  let episodes = await getEpisodesOfShow(id);
  populateEpisodes(episodes);
  $episodesArea.show();
}

$(".container").on("click",".Show-getEpisodes" , async function (evt) {
  let id = $(evt.target.closest(".Show")).data("show-id");
  await searchForEpisodesAndDisplay(id)
});
