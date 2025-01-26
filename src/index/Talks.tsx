import _ from "lodash";
import React from "react";
import toml from "toml";
import TALKS_RAW from "./talks.toml?raw";

export interface Talk {
  abstract: string;
  date: Date;
  title: string;
  url: string;
  venue: string;
}

function loadTalks() {
  let talks = toml.parse(TALKS_RAW).talks.map((talk: any) => ({
    ...talk,
    date: new Date(talk.date),
  })) as Talk[];
  return _.sortBy(talks, talks => -talks.date);
}

export const TALKS = loadTalks();

export let TalkEntry = ({ talk }: { talk: Talk }) => (
  <li>
    <a href={talk.url}>{talk.title}</a>
    <br />
    {talk.venue}, {talk.date.getFullYear()}
  </li>
);
