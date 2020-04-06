import PgnMoveParser from "./PgnMoveParser";
import {Tags} from "./types";
import _ from "lodash";
import {Move} from "./Move";

export interface PgnData {
    tags: Tags,
    result: string,
    moves: Move[],
    currentMove?: Move
}

export class PgnParser {
    private readonly pgn: string;
    private readonly tagText: string;
    private readonly moveText: string;

    constructor(pgn: string){
        this.pgn = pgn.trim();
        const pgnTokens = this.pgn.split("\n\n");

        if(this.hasTags()){
            this.tagText = pgnTokens[0];
            this.moveText = pgnTokens[1] ? pgnTokens[1] : "";
        } else {
            this.tagText = "";
            this.moveText = pgnTokens[0] ? pgnTokens[0] : "";
        }
    }

    public parse(): PgnData {
        const tags = this.parseTags();
        const moves = new PgnMoveParser(this.parseMoveText()).parse();

        return {
            tags,
            result: this.parseResult(),
            moves,
            currentMove: moves[moves.length - 1]
        };
    }

    private parseTags(): Tags {
        return this.tagText
            .split("[")
            .filter(tag => tag.trim())
            .map(tag => ({[tag.split(" ")[0]]: tag.split(`"`)[1]}))
            .reduce((tags, tag) => ({...tags, ...tag}), {});
    }

    private parseResult(): string {
        const result = _.last(this.moveText.split(" "));

        return result && result.match(/(\d-\d|\*)/) ? result.trim(): "*";
    }

    private parseMoveText(): string {
        const result = this.parseResult();

        return this.moveText
            .trim()
            .replace(/\n/g, " ")
            .split(" ")
            .map(token => token.trim())
            .filter(token => token !== result && token)
            .join(" ");
    }

    private hasTags(): boolean {
        return this.pgn.startsWith("[");
    }
}

export default PgnParser;
