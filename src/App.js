import React, { useState } from 'react';

// Main App component for the Music Lab Playlist Generator
const App = () => {
    // State to store the current URL input by the user for adding new projects
    const [inputUrl, setInputUrl] = useState('');
    // State to store the embed URL input by the user for loading playlists
    const [embedInputUrl, setEmbedInputUrl] = useState('');
    // State to store the list of full project URLs added to the playlist
    const [projectUrls, setProjectUrls] = useState([]);
    // State to store only the extracted channel IDs
    const [channelIds, setChannelIds] = useState([]);
    // State to manage any error messages displayed to the user
    const [errorMessage, setErrorMessage] = useState('');
    // State to control the visibility of the "Load Playlist" modal
    const [showLoadModal, setShowLoadModal] = useState(false);

    // Regular expression to validate and extract the channel ID from the Code.org project URL
    // It now accepts:
    // - https://studio.code.org/projects/music/{channelID}/edit
    // - https://studio.code.org/projects/music/{channelID}/view
    // - https://studio.code.org/projects/music/{channelID}/
    // - https://studio.code.org/projects/music/{channelID}
    const projectUrlRegex = /^https:\/\/studio\.code\.org\/projects\/music\/([a-zA-Z0-9_-]+)(?:\/edit|\/view|\/)?$/;

    // Regular expression to validate and extract channel IDs from the embed URL
    // It looks for the pattern: https://studio.code.org/musiclab/embed?channels={channelID1},{channelID2}&library=
    const embedUrlRegex = /^https:\/\/studio\.code.org\/musiclab\/embed\?channels=([a-zA-Z0-9_,-]*)&library=$/;


    // Effect hook to update the generated embed URL whenever channelIds change
    // This ensures the URL is always in sync with the current playlist
    const generatedEmbedUrl = `https://studio.code.org/musiclab/embed?channels=${channelIds.join(',')}&library=`;

    /**
     * Handles changes in the project URL input field.
     * Updates the inputUrl state and clears any previous error messages.
     * @param {Object} e - The event object from the input change.
     */
    const handleInputChange = (e) => {
        setInputUrl(e.target.value);
        setErrorMessage(''); // Clear error message on new input
    };

    /**
     * Handles changes in the embed URL input field (used in the modal).
     * Updates the embedInputUrl state and clears any previous error messages.
     * @param {Object} e - The event object from the input change.
     */
    const handleEmbedInputChange = (e) => {
        setEmbedInputUrl(e.target.value);
        setErrorMessage(''); // Clear error message on new input
    };

    /**
     * Handles the "Add to Playlist" button click.
     * Validates the input project URL, extracts the channel ID, and updates the state.
     */
    const handleAddProject = () => {
        const match = inputUrl.match(projectUrlRegex);

        if (match) {
            // If the URL matches the pattern, extract the channel ID
            const channelId = match[1];

            // Check if the project URL is already in the list to prevent duplicates
            if (!projectUrls.includes(inputUrl)) {
                // Add the full URL to projectUrls
                setProjectUrls([...projectUrls, inputUrl]);
                // Add the extracted channel ID to channelIds
                setChannelIds([...channelIds, channelId]);
                // Clear the input field after successful addition
                setInputUrl('');
                // Clear any error messages
                setErrorMessage('');
            } else {
                // If already exists, set an error message
                setErrorMessage('This project is already in your playlist.');
            }
        } else {
            // If the URL does not match the expected format, set an error message
            setErrorMessage('Invalid project URL format. Please use: https://studio.code.org/projects/music/{channelID}/edit');
        }
    };

    /**
     * Handles the removal of a project from the playlist.
     * Filters out the project and its corresponding channel ID based on the index.
     * @param {number} indexToRemove - The index of the project to remove.
     */
    const handleRemoveProject = (indexToRemove) => {
        // Filter out the project URL at the specified index
        const updatedProjectUrls = projectUrls.filter((_, index) => index !== indexToRemove);
        setProjectUrls(updatedProjectUrls);

        // Filter out the channel ID at the specified index
        const updatedChannelIds = channelIds.filter((_, index) => index !== indexToRemove);
        setChannelIds(updatedChannelIds);

        // Clear any error messages that might have been displayed
        setErrorMessage('');
    };

    /**
     * Handles loading a playlist from an embed URL (called from the modal).
     * Parses the embed URL, extracts channel IDs, and populates the playlist.
     */
    const handleLoadPlaylistFromEmbedUrl = () => {
        const match = embedInputUrl.match(embedUrlRegex);

        if (match) {
            const channelsString = match[1]; // Get the comma-separated channel IDs
            const newChannelIds = channelsString.split(',').filter(id => id.length > 0); // Split and filter out empty strings

            // Reconstruct project URLs from the extracted channel IDs
            const newProjectUrls = newChannelIds.map(id => `https://studio.code.org/projects/music/${id}/edit`);

            // Update the state with the new playlist
            setChannelIds(newChannelIds);
            setProjectUrls(newProjectUrls);
            setEmbedInputUrl(''); // Clear the embed URL input
            setErrorMessage('Playlist loaded successfully!'); // Success message
            setShowLoadModal(false); // Close the modal on success
        } else {
            setErrorMessage('Invalid embed URL format. Please use: https://studio.code.org/musiclab/embed?channels={channelID1},{channelID2}&library=');
        }
    };

    /**
     * Copies the generated embed URL to the user's clipboard.
     * Uses document.execCommand('copy') for broader compatibility within iframes.
     */
    const copyToClipboard = () => {
        // Create a temporary textarea element to hold the text to be copied
        const textarea = document.createElement('textarea');
        textarea.value = generatedEmbedUrl;
        // Make the textarea invisible and append it to the document
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        // Select the text in the textarea
        textarea.select();
        try {
            // Execute the copy command
            document.execCommand('copy');
            // Optionally, provide user feedback (e.g., a temporary success message)
            setErrorMessage('Link copied to clipboard!');
        } catch (err) {
            // Log any errors if copying fails
            console.error('Failed to copy text: ', err);
            setErrorMessage('Failed to copy link. Please copy manually.');
        } finally {
            // Remove the temporary textarea from the document
            document.body.removeChild(textarea);
        }
    };

    /**
     * Opens the generated embed URL in a new browser tab.
     */
    const openLinkInNewTab = () => {
        window.open(generatedEmbedUrl, '_blank');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 flex items-center justify-center p-4 font-sans">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl border border-gray-200">
                <h1 className="text-4xl font-extrabold text-center text-indigo-700 mb-8 tracking-tight">
                    Music Lab Playlist Generator
                </h1>

                {/* Input Section for adding new projects */}
                <div className="mb-6">
                    <label htmlFor="url-input" className="block text-lg font-medium text-gray-700 mb-2">
                        Enter Code.org Music Lab Project URL:
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            id="url-input"
                            type="text"
                            value={inputUrl}
                            onChange={handleInputChange}
                            placeholder="e.g., https://studio.code.org/projects/music/abcdef12345/edit"
                            className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-800"
                        />
                        <button
                            onClick={handleAddProject}
                            className="bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200 ease-in-out transform hover:scale-105"
                        >
                            Add to Playlist
                        </button>
                    </div>
                    {errorMessage && errorMessage.includes('project URL') && (
                        <p className="mt-3 text-red-600 text-sm font-medium">{errorMessage}</p>
                    )}
                </div>

                {/* Playlist Display Section */}
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-indigo-600 mb-4">Your Playlist:</h2>
                    {projectUrls.length === 0 ? (
                        <p className="text-gray-500 italic">No projects added yet.</p>
                    ) : (
                        <ul className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-60 overflow-y-auto">
                            {projectUrls.map((url, index) => {
                                const match = url.match(projectUrlRegex);
                                const channelId = match ? match[1] : 'N/A'; // Should always match here
                                const parts = url.split(channelId); // Split URL to highlight channel ID

                                return (
                                    <li key={index} className="flex items-center justify-between text-gray-700 break-all bg-white p-3 rounded-md shadow-sm border border-gray-100">
                                        <span className="flex-grow">
                                            {parts[0]}<strong className="text-indigo-600 font-bold">{channelId}</strong>{parts[1]}
                                        </span>
                                        <button
                                            onClick={() => handleRemoveProject(index)}
                                            className="ml-4 bg-red-500 text-white px-3 py-1 rounded-md shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-200 ease-in-out transform hover:scale-105 text-sm"
                                        >
                                            Remove
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                {/* Generated URL Section */}
                <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-200 shadow-inner">
                    <h2 className="text-2xl font-semibold text-indigo-600 mb-3">Generated Embed URL:</h2>
                    <div className="bg-white p-4 rounded-lg border border-gray-300 break-all text-gray-800 text-sm font-mono mb-4">
                        {channelIds.length > 0 ? generatedEmbedUrl : 'Add projects to generate URL...'}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={copyToClipboard}
                            disabled={channelIds.length === 0}
                            className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Copy Link
                        </button>
                        <button
                            onClick={openLinkInNewTab}
                            disabled={channelIds.length === 0}
                            className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Open Link
                        </button>
                        {/* New button to open the Load Playlist modal */}
                        <button
                            onClick={() => setShowLoadModal(true)}
                            className="bg-purple-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition duration-200 ease-in-out transform hover:scale-105"
                        >
                            Load Playlist from URL
                        </button>
                    </div>
                </div>

                {/* Load Playlist Modal */}
                {showLoadModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
                        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 relative">
                            <h2 className="text-2xl font-bold text-indigo-700 mb-6 text-center">
                                Load Playlist from Embed URL
                            </h2>
                            <label htmlFor="modal-embed-url-input" className="block text-lg font-medium text-gray-700 mb-2">
                                Enter Embed URL:
                            </label>
                            <input
                                id="modal-embed-url-input"
                                type="text"
                                value={embedInputUrl}
                                onChange={handleEmbedInputChange}
                                placeholder="e.g., https://studio.code.org/musiclab/embed?channels=abc,def&library="
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-800 mb-4"
                            />
                            {errorMessage && errorMessage.includes('embed URL') && (
                                <p className="mb-4 text-red-600 text-sm font-medium">{errorMessage}</p>
                            )}
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setShowLoadModal(false);
                                        setEmbedInputUrl(''); // Clear input on cancel
                                        setErrorMessage(''); // Clear error on cancel
                                    }}
                                    className="bg-gray-300 text-gray-800 px-6 py-3 rounded-lg shadow-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition duration-200 ease-in-out transform hover:scale-105"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleLoadPlaylistFromEmbedUrl}
                                    className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ease-in-out transform hover:scale-105"
                                >
                                    Load
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default App;
