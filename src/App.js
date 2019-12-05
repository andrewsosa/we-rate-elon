// @flow
import React, { useEffect, useState } from "react";
import axios from "axios";

import Emoji from "./components/Emoji";
import EMButton from "./components/EmojiButton";
import Spinner from "./components/Spinner";

import "tachyons/css/tachyons.min.css";
import "./globals.css";

const useRating = () => {
  const [state, setState] = useState({ loading: true, stats: null });

  const loadVotes = () => {
    axios
      .get("/api/elon")
      .catch(() => setState({ ...state, loading: false }))
      .then(resp => resp.data)
      .then(data => {
        console.log(data);
        setState({ loading: false, stats: data });
      });
  };

  useEffect(() => {
    loadVotes();
  }, []);

  const upvote = () => {
    setState({ ...state, loading: true });
    setTimeout(
      () =>
        axios
          .post("/api/elon/good")
          .then(() => loadVotes())
          .catch(() => setState({ ...state, loading: false })),
      500
    );
  };
  const downvote = () => {
    setState({ ...state, loading: true });
    setTimeout(
      () =>
        axios
          .post("/api/elon/bad")
          .then(() => loadVotes())
          .catch(() => setState({ ...state, loading: false })),
      500
    );
  };

  return [state, upvote, downvote];
};

export default function App() {
  const [state, upvote, downvote] = useRating();
  return (
    <div className="bg-green white sans-serif">
      <div className="center mw8 flex flex-column items-center vh-100 pb4 pt4 pt6-ns tc">
        <div className="pb2 tc">
          <img
            src="/img/elon-head-2.png"
            className="w5 dib no-select"
            alt="elon"
          />
        </div>
        <h1 className="f1 shadow spacemono fw7 i ttl">we rate elon</h1>
        <div className="pa4">
          <EMButton className="f2 ma4 pointer shadow" onClick={downvote}>
            <Emoji label="elon bad" symbol="👎" />
          </EMButton>
          <EMButton className="f2 ma4 pointer shadow" onClick={upvote}>
            <Emoji label="elon good" symbol="👍" />
          </EMButton>
        </div>
        {state.loading ? (
          <Spinner />
        ) : (
          <h2 className="f3 shadow spacemono">
            {`current elon rating: ${Math.floor(
              (state.stats.upvotes / state.stats.total) * 100
            )}%`}
          </h2>
        )}
      </div>
    </div>
  );
}
