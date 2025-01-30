import e, { Request, Response } from "express";
import { Roadmap } from "../entity/roadmap.entity";
import { Milestone } from "../entity/milestone.entity"
import { AppDataSource } from "../config";
import { UserInfo } from "../entity/user.entity";
import { ollamaNoStream, ollamaStream } from "../service/ollamaChat";
import { extractArrayFromResponse } from "../utils/extractstringtoarray";


export const createRoadmap = async (req: Request, res: Response) => {
    const roadmapRepo = AppDataSource.getRepository(Roadmap);
    const milestoneRepo = AppDataSource.getRepository(Milestone);
    const { goal } = req.body;
  
    try {
      if (!goal || typeof goal !== "string") {
        return res.status(400).json({ error: "Invalid request data" });
      }
      
      const user = await AppDataSource.getRepository(UserInfo).findOne({ where: { id: req.user?.id } });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      const query = `You are a helpful software development assistant. I want you to create a learning roadmap in the form of an array of objects. Each object should contain two properties: 
        title: A milestone or step in the roadmap.
        description: A detailed (50-word) description of that step.
        
        Your response should only be in this format without any other text outside of the array:
        [
          { "title": "Step 1 Title", "description": "Step 1 Description" },
          { "title": "Step 2 Title", "description": "Step 2 Description" }
        ]
        
        Now, create a ${goal} roadmap.`;
  
      const response = await ollamaNoStream([{ role: "user", content: query }]);
      const milestones = extractArrayFromResponse(response.message.content);
  
      if (!Array.isArray(milestones)) {
        return res.status(500).json({ error: "Invalid response format from AI" });
      }
      const roadmap = roadmapRepo.create({ title: goal, user });
      const savedRoadmap = await roadmapRepo.save(roadmap);
  
      const milestoneEntities = milestones.map((milestone) => {
        return milestoneRepo.create({
          title: milestone.title,
          description: milestone.description,
          roadmap: savedRoadmap,
        });
      });
      const savedMilestones = await milestoneRepo.save(milestoneEntities);     
       return res.status(201).json({ 

        message: "Roadmap created successfully",
         roadmap: roadmap.id,
         title:roadmap.title,
         milestones: savedMilestones.map((milestone) => ({
            milestoneId: milestone.id,
            title: milestone.title,
            description: milestone.description,
          })),
          });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
// GET: Retrieve roadmap
export const getRoadmap = async (req: Request, res: Response) => {
    const roadmapRepo = AppDataSource.getRepository(Roadmap);

    try {
        const roadmap = await roadmapRepo.find();
        if (!roadmap) {
            return res.status(404).json({ message: "Roadmap not found" });
        }

        return res.status(200).json({
            message: "Roadmap get successfully",
            roadmap
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// GET: Retrieve a roadmap by ID
export const getRoadmapById = async (req: Request, res: Response) => {
    const roadmapRepo = AppDataSource.getRepository(Roadmap);
    const roadmapId = req.params.id;

    try {
        const roadmap = await roadmapRepo.findOne({
            where: { id: roadmapId },
        });

        if (!roadmap) {
            return res.status(404).json({ message: "Roadmap not found" });
        }

        return res.status(200).json({
            message: "Roadmap get successfully",
            roadmap
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// DELETE: Delete a roadmap by ID
export const deleteRoadmap = async (req: Request, res: Response) => {
    const roadmapRepo = AppDataSource.getRepository(Roadmap);
    const roadmapId = req.params.id;
    try {
        await roadmapRepo.delete(roadmapId);
        return res.status(200).json({ message: "Roadmap deleted successfully" });
    } catch (error) {
        console.error(error);
        const roadmapId = req.params.id;
        try {
            await roadmapRepo.delete(roadmapId);
            return res.status(200).json({ message: "Roadmap deleted successfully" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
}
