import Project from "./project";
import DefaultMap from "./utils/map/DefaultMap";

export default class ProjectRepository {
	private static readonly projects = new DefaultMap<string, Project>();

	public static createIfAbsent(id: string) {
		return this.projects.computeIfAbsent(id, () => {
			const project = new Project(id);

			this.projects.set(id, project);
			this.register(project);

			return project;
		});
	}

	public static create = ProjectRepository.createIfAbsent;

	public static getById(id: string) {
		return this.projects.get(id);
	}

	private static register(project: Project) {
		this.projects.set(project.getId(), project);
	}

	public static unregister(project: Project) {
		this.projects.delete(project.getId());
	}
}
