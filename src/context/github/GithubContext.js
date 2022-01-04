import { createContext, useReducer } from "react";
import githubReducer from "./GithubReducer";

const GithubContext = createContext();

const GITHUB_URL =
  process.env.REACT_APP_GITHUB_URL;
const GITHUB_TOKEN =
  process.env.REACT_APP_GITHUB_TOKEN;

export const GithubProvider = ({ children }) => {
  const initialState = {
    users: [],
    user: {},
    loading: false,
  };

  const [state, dispatch] = useReducer(
    githubReducer,
    initialState
  );

  // get search results
  const searchUsers = async (text) => {
    try {
      setLoading();

      const params = new URLSearchParams({
        q: text,
      });

      const response = await fetch(
        `${GITHUB_URL}/search/users?${params}`,
        {
          headers: {
            Authorization: `token ${GITHUB_TOKEN}`,
          },
        }
      );
      const { items } = await response.json();

      dispatch({
        type: "GET_USERS",
        payload: items,
      });
    } catch (e) {
      console.error("err", e);
    }
  };

  // get single user
  const getUser = async (login) => {
    try {
      setLoading();

      const response = await fetch(
        `${GITHUB_URL}/users/${login}`,
        {
          headers: {
            Authorization: `token ${GITHUB_TOKEN}`,
          },
        }
      );

      if (response.status === 404) {
        window.location = "/notfound";
      } else {
        const data = await response.json();

        dispatch({
          type: "GET_USER",
          payload: data,
        });
      }
    } catch (e) {
      console.error("err", e);
    }
  };

  // Get user and repos
  const getUserRepos = async (login) => {
    const response = await fetch(
      `${GITHUB_URL}/users/${login}/repos`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
        },
      }
    );

    const data = await response.json();

    dispatch({
      type: "GET_REPOS",
      payload: data,
    });
  };

  const clearUsers = () =>
    dispatch({ type: "CLEAR_USERS" });

  const setLoading = () =>
    dispatch({ type: "SET_LOADING" });
  return (
    <GithubContext.Provider
      value={{
        user: state.user,
        users: state.users,
        loading: state.loading,
        searchUsers,
        clearUsers,
        getUser,
        getUserRepos,
        repos: state.repos,
      }}
    >
      {children}
    </GithubContext.Provider>
  );
};

export default GithubContext;
