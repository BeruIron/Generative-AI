import { Request, Response } from "express";
import { Roadmap } from "../entity/roadmap.entity";
import { AppDataSource } from "../config";
import { Like } from "typeorm";

export const Roadmapsearch = async (req: Request, res: Response) => {
    const roadmapRepo = AppDataSource.getRepository(Roadmap);

    try {
        const { keyword } = req.query;

        let results;
        if (keyword && typeof keyword === 'string') {
            results = await roadmapRepo.find({
                where: {
                    title: Like(`%${keyword}%`), 
                },
                take: 1, 
            });
        } else {
            results = await roadmapRepo.find();
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "No roadmap found" });
        }

        return res.status(200).json({
            message: "Roadmaps retrieved successfully",
            results,
        });
    } catch (error) {
        console.error("Error fetching roadmaps:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

