// Set current year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// DOM elements
const statsContainer = document.getElementById('stats-container');
const reposContainer = document.getElementById('repos-container');
const searchInput = document.getElementById('search-repo');
const sortSelect = document.getElementById('sort-by');

// GitHub username
const username = 'RzlAm';

// Fetch user data
async function fetchUserData() {
		try {
				const response = await fetch(`https://api.github.com/users/${username}`);
				const userData = await response.json();
				return userData;
		} catch (error) {
				console.error('Error fetching user data:', error);
				return null;
		}
}

// Fetch repositories data
async function fetchReposData() {
		try {
				let allRepos = [];
				let page = 1;
				let hasMore = true;
				
				// Keep fetching until all pages are processed
				while (hasMore) {
						const response = await fetch(`https://api.github.com/users/${username}/repos?page=${page}&per_page=100`);
						const repos = await response.json();
						
						if (repos.length === 0) {
								hasMore = false;
						} else {
								allRepos = [...allRepos, ...repos];
								page++;
						}
				}
				
				// Filter out forks and private repos
				return allRepos.filter(repo => !repo.fork && !repo.private);
		} catch (error) {
				console.error('Error fetching repos:', error);
				return [];
		}
}

// Fetch contributor count for a repo
async function fetchContributorCount(repoName) {
		try {
				const response = await fetch(`https://api.github.com/repos/${username}/${repoName}/contributors?per_page=1`);
				
				if (response.status === 200) {
						const linkHeader = response.headers.get('Link');
						if (linkHeader) {
								const matches = linkHeader.match(/page=(\d+)>; rel="last"/);
								if (matches && matches[1]) {
										return parseInt(matches[1]);
								}
						} else {
								const contributors = await response.json();
								return contributors.length > 0 ? 1 : 0;
						}
				}
				return 0;
		} catch (error) {
				console.error(`Error fetching contributors for ${repoName}:`, error);
				return 0;
		}
}

// Display user stats
async function displayUserStats() {
		const userData = await fetchUserData();
		
		if (userData) {
				const publicReposCount = userData.public_repos;
				const followersCount = userData.followers;
				const followingCount = userData.following;
				
				const statsHTML = `
						<div class="stat-card p-6 rounded-lg transition-all duration-300">
								<div class="text-gray-400 mb-4">
										<i class="fas fa-folder-open text-4xl"></i>
								</div>
								<h3 class="text-2xl font-bold text-white mb-2">${publicReposCount}</h3>
								<p class="text-gray-500">Public Repositories</p>
						</div>
						<div class="stat-card p-6 rounded-lg transition-all duration-300">
								<div class="text-gray-400 mb-4">
										<i class="fas fa-users text-4xl"></i>
								</div>
								<h3 class="text-2xl font-bold text-white mb-2">${followersCount}</h3>
								<p class="text-gray-500">Followers</p>
						</div>
						<div class="stat-card p-6 rounded-lg transition-all duration-300">
								<div class="text-gray-400 mb-4">
										<i class="fas fa-user-friends text-4xl"></i>
								</div>
								<h3 class="text-2xl font-bold text-white mb-2">${followingCount}</h3>
								<p class="text-gray-500">Following</p>
						</div>
				`;
				
				statsContainer.innerHTML = statsHTML;
		} else {
				statsContainer.innerHTML = '<p class="text-red-500">Failed to load user stats. Please try again later.</p>';
		}
}

// Display repositories
async function displayRepositories() {
		const repos = await fetchReposData();
		
		if (repos.length === 0) {
				reposContainer.innerHTML = '<p class="text-gray-600 text-center py-8">No public repositories found.</p>';
				return;
		}
		
		// Enhance repos with contributor counts
		const enhancedRepos = await Promise.all(repos.map(async repo => {
				const contributorCount = await fetchContributorCount(repo.name);
				return {
						...repo,
						contributor_count: contributorCount
				};
		}));
		
		// Popularity score calculation
		const reposWithScore = enhancedRepos.map(repo => ({
				...repo,
				popularity_score: repo.stargazers_count * 2 + repo.forks_count * 1 + repo.watchers_count * 0.5
		}));
		
		// Default sort by popularity
		let sortedRepos = [...reposWithScore].sort((a, b) => b.popularity_score - a.popularity_score);
		
		// Function to render repos
		const renderRepos = (reposToRender) => {
				reposContainer.innerHTML = '';
				
				if (reposToRender.length === 0) {
						reposContainer.innerHTML = '<p class="text-gray-600 text-center py-8">No repositories match your search.</p>';
						return;
				}
				
				const reposHTML = reposToRender.map(repo => `
						<div class="repo-card rounded-lg overflow-hidden mb-6">
								<div class="p-6">
										<div class="flex justify-between items-start mb-3">
												<h3 class="text-xl font-bold text-white truncate">
														<a href="${repo.html_url}" target="_blank" class="hover:text-gray-300 transition-colors">${repo.name}</a>
												</h3>
												${repo.archived ? '<span class="text-sm font-medium px-2.5 py-0.5 rounded bg-gray-800 text-gray-400">Archived</span>' : ''}
										</div>
										
										<p class="text-gray-500 mb-4">${repo.description || 'No description provided.'}</p>
										
										<div class="flex flex-wrap gap-4 mb-4">
												<div class="flex items-center text-gray-400">
														<i class="fas fa-code-branch mr-2 text-gray-500"></i>
														<span>${repo.language || 'Unknown'}</span>
												</div>
												<div class="flex items-center text-gray-400">
														<i class="fas fa-calendar-alt mr-2 text-gray-500"></i>
														<span>${new Date(repo.updated_at).toLocaleDateString()}</span>
												</div>
										</div>
										
										<div class="flex flex-wrap gap-4 pt-4 border-t border-gray-800">
												<div class="flex items-center text-gray-400">
														<i class="fas fa-star mr-2 text-gray-500"></i>
														<span>${repo.stargazers_count}</span>
												</div>
												<div class="flex items-center text-gray-400">
														<i class="fas fa-code-branch mr-2 text-gray-500"></i>
														<span>${repo.forks_count}</span>
												</div>
												<div class="flex items-center text-gray-400">
														<i class="fas fa-users mr-2 text-gray-500"></i>
														<span>${repo.contributor_count}</span>
												</div>
										</div>
								</div>
						</div>
				`).join('');
				
				reposContainer.innerHTML = `
						<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
								${reposHTML}
						</div>
				`;
		};
		
		// Initial render with all repos sorted by popularity
		renderRepos(sortedRepos);
		
		// Search functionality
		searchInput.addEventListener('input', (e) => {
				const searchTerm = e.target.value.toLowerCase();
				const filteredRepos = sortedRepos.filter(repo => 
						repo.name.toLowerCase().includes(searchTerm) || 
						(repo.description && repo.description.toLowerCase().includes(searchTerm))
				);
				renderRepos(filteredRepos);
		});
		
		// Sort functionality	
		sortSelect.addEventListener('change', (e) => {
				switch (e.target.value) {
						case 'stars':
								sortedRepos = [...reposWithScore].sort((a, b) => b.stargazers_count - a.stargazers_count);
								break;
						case 'forks':
								sortedRepos = [...reposWithScore].sort((a, b) => b.forks_count - a.forks_count);
								break;
						case 'updated':
								sortedRepos = [...reposWithScore].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
								break;
						case 'popularity':
						default:
								sortedRepos = [...reposWithScore].sort((a, b) => b.popularity_score - a.popularity_score);
				}
				
				const searchTerm = searchInput.value.toLowerCase();
				const filteredRepos = searchTerm 
						? sortedRepos.filter(repo => 
								repo.name.toLowerCase().includes(searchTerm) || 
								(repo.description && repo.description.toLowerCase().includes(searchTerm))
							)
						: [...sortedRepos];
				
				renderRepos(filteredRepos);
		});
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
		displayUserStats();
		displayRepositories();
});