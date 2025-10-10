import hasIn from 'lodash/hasIn'
import { reactive } from 'vue'
import { defineStore } from 'pinia'

import { apiInstance as api } from '@/api/apiInstance'

export const useDocumentNotesStore = defineStore('documentNotes', () => {
  const notes = reactive({})

  /**
   * Delete all notes for each project
   * @returns {void}
   */
  const reset = () => Object.keys(notes).forEach(key => delete notes[key])

  /**
   * Set a list of notes for a given project
   * @param {Object} options
   * @param {string} options.project - The project name
   * @param {Array} options.notes - The notes to set
   * @returns {Array} The notes set
   */
  const set = ({ project, notes: values }) => {
    notes[project] = values
    return values
  }

  /**
   * Get notes for a given project
   * @param {Object} options
   * @param {string} options.project - The project name
   * @returns {Array} The notes for the project
   */
  const getNotes = ({ project }) => {
    return notes[project] || []
  }

  /**
   * Get notes for a given path in a project
   * @param {Object} options
   * @param {string} options.project - The project name
   * @param {string} options.path - The path to filter on
   * @returns {Array} The notes for the path
   */
  const getNotesByPath = ({ project, path }) => {
    if (!hasIn(notes, project)) {
      return []
    }
    return notes[project].filter(note => path.startsWith(note.path))
  }

  /**
   * Fetch notes from the API for a given project
   * @param {Object} options
   * @param {string} options.project - The project name
   * @returns {Promise<Array>} The notes set
   */
  const fetchNotes = async ({ project }) => {
    const notes = await api.retrieveNotes(project)
    return set({ project, notes })
  }

  /**
   * Fetch notes once from the API for a given project
   * @param {Object} options
   * @param {string} options.project - The project name
   * @returns {Promise<Array>} The notes set
   */
  const fetchNotesOnce = async ({ project }) => {
    if (hasIn(notes, project)) {
      return notes[project]
    }
    return await fetchNotes({ project })
  }

  /**
   * Fetch notes for a given path.
   * @param {Object} options
   * @param {string} options.project - The project name
   * @param {string} options.path - The path to filter on
   * @returns {Promise<Array>} The notes set
   */
  const fetchNotesByPath = async ({ project, path }) => {
    await fetchNotesOnce({ project })
    return getNotesByPath({ project, path })
  }

  return { notes, reset, set, getNotesByPath, getNotes, fetchNotes, fetchNotesOnce, fetchNotesByPath }
})
