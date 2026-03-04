
interface TutorProfileProps {
    tutor: Tutor;
}

export default function Tutor({ tutor }: TutorProfileProps) {
    return (
        <div>
            <h3>{tutor.id}</h3>
            <p>Био: {tutor.bio}</p>
            <p>Образование: {tutor.education}</p>
            <p>Ставка в час: ${tutor.hourlyRate}</p>
        </div>
    );
}