import filter from 'lodash/filter'
import hasIn from 'lodash/hasIn'
import { reactive } from 'vue'
import { defineStore } from 'pinia'

export const useDocumentNotes = (api) => {
  return defineStore('documentNotes', () => {
    const notes = reactive({})

    /**
     * Delete all notes for each project
     * @returns {void}
     */
    const reset = () => Object.keys(notes).forEach((key) => delete notes[key])

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
      const notes = await fetchNotesOnce({ project })
      return notes.filter((note) => path.startsWith(note.path))
    }

    return { notes, reset, set, fetchNotesByPath, fetchNotes, fetchNotesOnce }
  })()
}
