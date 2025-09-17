
// Modulos clases que se necesitan
const fs = require('fs');
const readline = require('readline');
const Alumno = require('./alumnos');
const Carrera = require('./carreras');

const rl = readline.createInterface({
    input: process.stdin, //proceso de entrada (pregunta o instrucciones para leer entrada de datos)
    output: process.stdout //funcion que procesa el dato recibido en el input lo transforma y genera un output
});

const dataFolder = './data/';
const alumnosFile = dataFolder + 'alumnos.json';
const carrerasFile = dataFolder + 'carreras.json';

let alumnos = [];
let carreras = [];

function cargarDatos() {
    //instrucciones para leer datos del archivo .json y cargarlo en los arreglos
    fs.readFile(alumnosFile, 'utf8', (err, data) => {
        if (err) {
            console.log('Hubo un error al leer el archivo', err);
        }

        if (data) {
            alumnos = JSON.parse(data);
        }
    });

    fs.readFile(carrerasFile, 'utf8', (err, data) => {
        if (err) {
            console.log('Hubo un error al leer el archivo', err);
        }

        if (data) {
            carreras = JSON.parse(data);
        }
    });
}

function guardarDatos() {
    //instrucciones para guardar datos en el archivo .json
    fs.writeFile(alumnosFile, JSON.stringify(alumnos), (err) => {
        if (err) {
            console.log('Sucedio un error al escribir en el archivo.', err);
            return;
        }
    });

    fs.writeFile(carrerasFile, JSON.stringify(carreras), (err) => {
        if (err) {
            console.log('Sucedio un error al escribir en el archivo.', err);
            return;
        }
    });
}

function mostrarMenuPrincipal() {
    console.log('\n** Menú **');
    console.log('1. Alumnos');
    console.log('2. Carreras');
    console.log('3. Salir');
}

function mostrarSubMenuEntidad(entidad) {
    console.log(`\n** ${entidad} **`);
    console.log('1. Ver listado');
    console.log('2. Agregar');
    console.log('3. Borrar');
    console.log('4. Cambiar');
    console.log('5. Agregar alumno a carrera');
    console.log('6. Volver al menú principal');
}

function mostrarListado(entidad) {
    //instrucciones para mostrar el listado
    console.log(`\n** Listado de ${entidad} **`);
    if (entidad === 'alumnos') {
        for (i in alumnos) {
            console.log(`- ID: ${alumnos[i].id}, Nombre: ${alumnos[i].nombre}, Carrera: ${alumnos[i].carrera === null ? "Ninguna" : alumnos[i].carrera}`);
        }
    } else if (entidad === "carreras") {
        for (i in carreras) {
            console.log(`- ID: ${carreras[i].id}, Nombre: ${carreras[i].nombre}, Alumnos: ${carreras[i].alumnos.length === 0 ? "Ninguno" : JSON.stringify(carreras[i].alumnos)}`);
        }
    }
}

function agregar(entidad, clase) {
    rl.question(`Ingrese el nombre del nuevo ${entidad}: `, nombre => {
        //instrucciones para añadir el elemento a la lista (recuerda guardar los cambios en el json)
        if (clase === Alumno) {
            alumnos.push(new Alumno(alumnos.length, nombre));
        } else if (clase === Carrera) {
            carreras.push(new Carrera(carreras.length, nombre));
        }

        console.log(`Se agregó el nuevo ${entidad} correctamente!`);
        guardarDatos();
        seleccionarAccionPrincipal();
    });
}

function borrar(entidad, clase) {
    mostrarListado(entidad);
    rl.question(`Ingrese el ID del ${entidad} que desea borrar: `, id => {
        //instrucciones para eliminar el elemento a la lista (recuerda guardar los cambios en el json)
        if (clase === Alumno) {
            //Se busca el alumno por su id en el arreglo
            const indice = alumnos.findIndex(i => i.id === parseInt(id));

            //Se valida que el alumno exista
            if (indice === -1) {
                console.log('Opción no válida.');
                borrar(entidad, clase);
            } else {
                //Si el alumno está inscrito en una carrera, se elimina de esta.
                if (alumnos[indice].carrera) {
                    const carrera = carreras.find(c => c.nombre === alumnos[indice].carrera);
                    if (carrera) {
                        carrera.alumnos = carrera.alumnos.filter(i => i.id !== alumnos[indice].id);
                    }
                }

                alumnos.splice(indice, 1);

                console.log('Se ha eliminado el alumno correctamente!');
                guardarDatos();
                seleccionarAccionPrincipal();
            }
        } else if (clase === Carrera) {
            //Se busca la carrera por su id en el arreglo
            const indice = carreras.findIndex(i => i.id === parseInt(id));

            //Se valida que la carrera exista.
            if (indice === -1) {
                console.log('Opción no válida.');
                borrar(entidad, clase);
            } else {
                //Si la carrera tiene alumnos inscritos, se elimina la carrera de cada uno.
                if (carreras[indice].alumnos) {
                    alumnos.forEach(alumno => {
                        if (alumno.carrera === carreras[indice].nombre) {
                            alumno.carrera = null;
                        }
                    });
                }

                carreras.splice(indice, 1);

                console.log('Se ha eliminado la carrera correctamente!');
                guardarDatos();
                seleccionarAccionPrincipal();
            }
        }
    });
}

function cambiar(entidad, clase) {
    mostrarListado(entidad);
    rl.question(`Ingrese el ID del ${entidad} que desea cambiar: `, id => {
        if (clase === Alumno) {
            const indice = alumnos.findIndex(i => i.id === parseInt(id));

            if (indice === -1) {
                console.log('Opción no válida.');
                modificar(entidad, clase);
            } else {
                const alumno = alumnos[indice];

                console.log(`Alumno seleccionado: ${alumno.nombre}, Carrera: ${alumno.carrera || 'Ninguna'}`);
                rl.question('¿Desea modificar el (1) Nombre o (2) Carrera?: ', opcion => {
                    if (opcion === '1') {
                        rl.question('Ingrese el nuevo nombre: ', nuevoNombre => {
                            alumno.nombre = nuevoNombre;
                            console.log('Nombre actualizado correctamente!');
                            guardarDatos();
                            seleccionarAccionPrincipal();
                        });
                    } else if (opcion === '2') {
                        mostrarListado('carreras');
                        rl.question('Ingrese el ID de la nueva carrera: ', idCarrera => {
                            const nuevaCarrera = carreras.find(c => c.id === parseInt(idCarrera));
                            if (!nuevaCarrera) {
                                console.log('Carrera no encontrada.');
                                modificar(entidad, clase);
                                return;
                            }

                            // Dar de baja de la carrera anterior
                            if (alumno.carrera) {
                                const carreraAnterior = carreras.find(c => c.nombre === alumno.carrera);
                                if (carreraAnterior) {
                                    carreraAnterior.alumnos = carreraAnterior.alumnos.filter(a => a.id !== alumno.id);
                                }
                            }

                            // Asignar a la nueva carrera
                            alumno.carrera = nuevaCarrera.nombre;
                            nuevaCarrera.alumnos.push(alumno);

                            console.log('Carrera cambiada correctamente!');
                            guardarDatos();
                            seleccionarAccionPrincipal();
                        });
                    } else {
                        console.log('Opción no válida.');
                        modificar(entidad, clase);
                    }
                });
            }
        } else if (clase === Carrera) {
            const indice = carreras.findIndex(i => i.id === parseInt(id));

            if (indice === -1) {
                console.log('Opción no válida.');
                modificar(entidad, clase);
            } else {
                const carrera = carreras[indice];
                console.log(`Carrera seleccionada: ${carrera.nombre}`);
                rl.question('Ingrese el nuevo nombre de la carrera: ', nuevoNombre => {
                    // Actualizar nombre en la carrera
                    const nombreAnterior = carrera.nombre;
                    carrera.nombre = nuevoNombre;

                    // Actualizar el nombre de la carrera en los alumnos inscritos
                    alumnos.forEach(alumno => {
                        if (alumno.carrera === nombreAnterior) {
                            alumno.carrera = nuevoNombre;
                        }
                    });

                    console.log('Carrera modificada correctamente!');
                    guardarDatos();
                    seleccionarAccionPrincipal();
                });
            }
        }
    });
}

function asignarAlumnoACarrera() {
    mostrarListado('alumnos');
    rl.question(`Ingrese el ID del alumno que desea asignar a una carrera: `, idAlumno => {
        //instrucciones para asignar un alumno a una carrera
        //valida que el indice ingresado sea de un dato dentro del arreglo.
        if (idAlumno < 0 || idAlumno >= alumnos.length) {
            console.log('Opción no válida.');
            asignarAlumnoACarrera();
        } else {
            mostrarListado('carreras');
            rl.question(`Ingrese el ID de la carrera a la que desea asignar el alumno: `, idCarrera => {

                //valida que el indice ingresado sea de un dato dentro del arreglo.
                if (idCarrera < 0 || idCarrera >= carreras.length) {
                    console.log('Opción no válida.');
                    asignarAlumnoACarrera();
                } else {

                    //valida si el alumno ya está incrito en la carrera para no inscribirlo nuevamente.
                    if (carreras[idCarrera].alumnos.some(a => a.id === alumnos[idAlumno].id)) {
                        console.log('El alumno ya está inscrito en la carrera.');
                        seleccionarAccionEntidad('carreras');
                    } else {

                        //valida si el alumno está inscrito en otra carrera para no inscribirlo.
                        if (alumnos[idAlumno].carrera) {
                            console.log('El alumno ya se encuentra inscrito en una carrera.');
                            seleccionarAccionEntidad('carreras');
                        } else {
                            carreras[idCarrera].alumnos.push(alumnos[idAlumno]);
                            alumnos[idAlumno].carrera = carreras[idCarrera].nombre;

                            console.log('Se agregó el alumno correctamente.')
                            guardarDatos();
                            seleccionarAccionEntidad('carreras');
                        }
                    }
                }
            });
        }
    });
}

function seleccionarAccionPrincipal() {
    cargarDatos();
    mostrarMenuPrincipal();
    rl.question('Seleccione una opción: ', opcion => {
        switch (opcion) {
            case '1':
                seleccionarAccionEntidad('alumnos');
                break;
            case '2':
                seleccionarAccionEntidad('carreras');
                break;
            case '3':
                console.log('¡Hasta luego!');
                guardarDatos();
                rl.close();
                break;
            default:
                console.log('Opción no válida.');
                seleccionarAccionPrincipal();
        }
    });
}

// Modifica la función para seleccionar acción en entidad (listado, agregar, borrar, cambiar)
function seleccionarAccionEntidad(entidad) {
    cargarDatos();
    mostrarSubMenuEntidad(entidad);
    rl.question(`Seleccione una opción en ${entidad}: `, opcion => {
        switch (opcion) {
            case '1':
                mostrarListado(entidad);
                seleccionarAccionEntidad(entidad);
                break;
            case '2':
                agregar(entidad, entidad === 'alumnos' ? Alumno : Carrera);
                break;
            case '3':
                borrar(entidad, entidad === 'alumnos' ? Alumno : Carrera);
                break;
            case '4':
                cambiar(entidad, entidad === 'alumnos' ? Alumno : Carrera);
                break;
            case '5':
                asignarAlumnoACarrera();
                break;
            case '6':
                seleccionarAccionPrincipal();
                break;
            default:
                console.log('Opción no válida.');
                seleccionarAccionEntidad(entidad);
        }
    });
}

// Iniciar el programa
seleccionarAccionPrincipal();
