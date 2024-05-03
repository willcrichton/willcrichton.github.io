type TagName =
  | "author"
  | "title"
  | "year"
  | "publisher"
  | "address"
  | "url"
  | "doi"
  | "isbn"
  | "series"
  | "booktitle"
  | "pages"
  | "numpages"
  | "keywords"
  | "location"
  | "eprint"
  | "number"
  | "abstract"
  | "artifact"
  | "github"
  | "video"
  | "school";

type CitationType = "inproceedings" | "article" | "phdthesis" | "mastersthesis";

interface RawBibtexEntry {
  citationKey: string;
  entryType: CitationType;
  entryTags: { [key in TagName]: string };
}

declare module "@orcid/bibtex-parse-js" {
  export function toJSON(contents: string): RawBibtexEntry[];
}
