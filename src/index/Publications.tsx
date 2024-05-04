import bibtexParse from "@orcid/bibtex-parse-js";
import _ from "lodash";
import React from "react";

import { ContextAnchor, ContextLink } from "./ContextPanel";
import "./Publications.scss";
import bibtexSrc from "./assets/papers.bib?raw";

function stripTex(s: string): string {
  return s.replaceAll(/[{}]/g, "");
}

export class BibtexEntry {
  citationKey: string;
  type: CitationType;
  authors: string[];
  tags: { [key in TagName]: string };
  venue: string;
  year: number;

  constructor(entry: RawBibtexEntry) {
    this.citationKey = entry.citationKey;
    this.type = entry.entryType;
    this.tags = _.fromPairs(
      Object.entries(entry.entryTags).map(([k, v]) => [k, stripTex(v)])
    ) as any;
    this.authors = this.tags.author
      ? this.tags.author
          .split(" and ")
          .map(name => name.split(", ").reverse().join(" "))
      : [];
    this.venue = this.isDissertation()
      ? this.tags.school
      : entry.entryType == "inproceedings"
      ? this.tags.series.split(" ").slice(0, -1).join(" ")
      : this.tags.number;
    this.year = parseInt(this.tags.year);
  }

  isDissertation() {
    return this.type == "phdthesis" || this.type == "mastersthesis";
  }

  isWorkshop() {
    const WORKSHOPS = ["FUNARCH", "HATRA", "PLATEAU", "SNAPL"];
    return !this.isDissertation() && WORKSHOPS.includes(this.venue);
  }

  isConference() {
    return !this.isDissertation() && !this.isWorkshop();
  }
}

export class Publications {
  entries: BibtexEntry[];

  constructor() {
    this.entries = bibtexParse
      .toJSON(bibtexSrc)
      .map(rawEntry => new BibtexEntry(rawEntry));
    this.entries = _.orderBy(
      this.entries,
      entry => [entry.year, entry.tags.title],
      ["desc", "asc"]
    );
  }

  entry(key: string): BibtexEntry {
    let entry = this.entries.find(entry => entry.citationKey == key);
    if (!entry) throw new Error(`Could not find entry with key: ${key}`);
    return entry;
  }
}

let BibMeta = ({ entry }: { entry: BibtexEntry }) => {
  let tags = entry.tags;
  return (
    <>
      <div className="bib-authors">
        {entry.authors.map((author, i) => (
          <span className="author" key={i}>
            {author}
          </span>
        ))}
        .
      </div>
      <div className="bib-meta">
        {entry.isDissertation() ? (
          <>
            {entry.venue} {tags.year}
          </>
        ) : (
          <abbr>
            {entry.venue} {tags.year}
          </abbr>
        )}
        .{" "}
        {tags.doi && (
          <span>
            <a className="body" href={`https://doi.org/${tags.doi}`}>
              <abbr>Doi</abbr>
            </a>
            .{" "}
          </span>
        )}
        {tags.eprint && (
          <span>
            <a className="body" href={`https://arxiv.org/abs/${tags.eprint}`}>
              arXiv
            </a>
            .{" "}
          </span>
        )}
        {!tags.doi && !tags.eprint && tags.url && (
          <span>
            <a className="body" href={tags.url}>
              <abbr>URL</abbr>
            </a>
            .{" "}
          </span>
        )}
        {tags.video && (
          <span>
            <a className="body" href={tags.video}>
              Video
            </a>
            .{" "}
          </span>
        )}
        {tags.github && (
          <span>
            <a className="body" href={tags.github}>
              Github
            </a>
            .{" "}
          </span>
        )}
        {tags.artifact && (
          <span>
            <a className="body" href={tags.artifact}>
              Artifact
            </a>
            .{" "}
          </span>
        )}
      </div>
    </>
  );
};

let BibSummary = ({ entry }: { entry: BibtexEntry }) => {
  let tags = entry.tags;
  return (
    <div className="bib-summary">
      <ContextAnchor id={entry.citationKey}>{tags.title}</ContextAnchor>
      <BibMeta entry={entry} />
    </div>
  );
};

export let BibEntryView = ({ entry }: { entry: BibtexEntry }) => {
  let tags = entry.tags;
  return (
    <ContextLink
      contextId={entry.citationKey}
      summary={<BibSummary entry={entry} />}
      contextTitle={
        <>
          <h3>{tags.title}</h3>
          <BibMeta entry={entry} />
        </>
      }
    >
      <p>{tags.abstract}</p>
    </ContextLink>
  );
};

export let PublicationsContext = React.createContext<Publications | undefined>(
  undefined
);
