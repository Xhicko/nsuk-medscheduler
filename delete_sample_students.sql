-- SQL query to delete the sample students created earlier
DELETE FROM students 
WHERE matric_number IN (
    'NSUK/NAS/CSC/100001/2025',
    'NSUK/NAS/CSC/100002/2025',
    'NSUK/ART/ENG/100003/2025',
    'NSUK/ADM/BUS/100004/2025',
    'NSUK/LAW/CML/100005/2025'
);
